import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ARRIVALS_PER_VERTICAL, ARRIVE_MS, HERO_ORDER, cycleReducer, initialCycle, verticalLabel } from "@/components/hero/cycle";
import { canRun3D, resetWebGLProbe } from "@/components/hero/env";
import { HERO_SCREENS } from "@/components/visuals/sample";
import { HERO } from "@/lib/content";

/**
 * The hero (decisions.md, 15 Nov 2026, "ONE wow moment"): the headline, the order the live screen walks through
 * the businesses, and the flat device for "reduce motion" and for browsers without WebGL.
 */

// The 3D scene is never loaded in tests: next/dynamic gives a marker instead, so we can see whether the hero asked for it.
vi.mock("next/dynamic", () => ({
  default: () =>
    function DeviceSceneMarker() {
      return <div data-testid="device-scene" />;
    },
}));

class IO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe() {
    this.cb([{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

/** matchMedia that answers true for the given queries. */
function stubMedia(matching: string[]) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matching.includes(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  }));
}

/** WebGL on or off for the probe in components/hero/env.ts. */
function stubWebGL(on: boolean) {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((type: string) =>
    on && /webgl/.test(type) ? ({ getParameter: () => 0, getExtension: () => null } as unknown as WebGLRenderingContext) : null) as never);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IntersectionObserver", IO);
  Object.defineProperty(navigator, "hardwareConcurrency", { value: 8, configurable: true });
  resetWebGLProbe();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("the headline", () => {
  it("keeps line one and turns line two through the four turns, in order", () => {
    expect(HERO.title).toBe("Running a business is hard.");
    expect(HERO.turns.map((t) => `${t.from} → ${t.to}`)).toEqual([
      "Missed calls → answered.",
      "Paper orders → online orders.",
      "Lost leads → followed up.",
      "Forgotten visits → reminded.",
    ]);
  });

  it("renders the first turn on first paint, then moves to the next", async () => {
    stubMedia([]);
    const { HeadlineTurns, TURN_MS } = await import("@/components/hero/HeadlineTurns");
    const { container } = render(<HeadlineTurns turns={HERO.turns} />);
    const active = () => container.querySelector("[data-active-turn]")?.textContent?.replace(/\s+/g, " ").trim();
    expect(active()).toBe("Missed calls → answered.");
    // Screen readers get every turn once, as plain text.
    expect(container.querySelector(".sr-only")?.textContent).toBe(
      "Missed calls, answered. Paper orders, online orders. Lost leads, followed up. Forgotten visits, reminded.",
    );
    act(() => vi.advanceTimersByTime(TURN_MS));
    expect(container.querySelector("[data-turn]")?.getAttribute("data-turn")).toBe("1");
  });

  it("stays on the first turn for reduce motion", async () => {
    stubMedia(["(prefers-reduced-motion: reduce)"]);
    const { HeadlineTurns, TURN_MS } = await import("@/components/hero/HeadlineTurns");
    const { container } = render(<HeadlineTurns turns={HERO.turns} />);
    act(() => vi.advanceTimersByTime(TURN_MS * 3));
    expect(container.querySelector("[data-turn]")?.getAttribute("data-turn")).toBe("0");
  });

  it("renders in the hero, with the subline and both buttons", async () => {
    stubMedia(["(prefers-reduced-motion: reduce)"]);
    const { HeroFrame } = await import("@/components/home/frames");
    const { container, getByRole } = render(<HeroFrame />);
    expect(getByRole("heading", { level: 1 }).textContent).toMatch(/^Running a business is hard\./);
    expect(container.textContent).toContain(HERO.line);
    expect(getByRole("link", { name: "Book a free call" })).toBeTruthy();
    expect(getByRole("link", { name: "See live demos" })).toBeTruthy();
  });
});

describe("the live screen's cycle", () => {
  it("walks Cafe and restaurant, Clinic, Business CRM, Events and ticketing, in that order", () => {
    expect([...HERO_ORDER]).toEqual(["cafe", "clinic", "crm", "events"]);
    expect(HERO_ORDER.map((_, i) => verticalLabel(i))).toEqual(["Cafe and restaurant", "Clinic", "Business CRM", "Events and ticketing"]);
  });

  it("brings a new item every tick, then moves to the next business, and wraps round", () => {
    let s = initialCycle();
    const seen: number[] = [s.index];
    for (let i = 0; i < 4 * (ARRIVALS_PER_VERTICAL + 1); i++) {
      const before = s;
      s = cycleReducer(s, { type: "tick" });
      if (s.index === before.index) {
        expect(s.items[0].id).not.toBe(before.items[0].id);
        expect(s.latest).toBe(s.items[0].id);
      } else seen.push(s.index);
    }
    expect(seen).toEqual([0, 1, 2, 3, 0]);
    expect(ARRIVE_MS).toBeGreaterThanOrEqual(2000);
    expect(ARRIVE_MS).toBeLessThanOrEqual(3000);
  });

  it("moves the live count as items arrive (tickets count by the ticket)", () => {
    let s = initialCycle(3);
    const start = s.count;
    s = cycleReducer(s, { type: "tick" });
    expect(s.count).toBe(start + (HERO_SCREENS.events.incoming[0].add ?? 1));
  });

  it("shifts to another business when scrolled, in the same order", () => {
    const s = cycleReducer(initialCycle(), { type: "shift", by: 2 });
    expect(HERO_ORDER[s.index]).toBe("crm");
    expect(HERO_ORDER[cycleReducer(s, { type: "shift", by: -3 }).index]).toBe("events");
  });

  it("shows the new business at once when the screen changes fast, so it is never left empty", async () => {
    stubMedia([]);
    const { PhoneUI, LaptopUI } = await import("@/components/hero/LiveScreens");
    for (const Screen of [PhoneUI, LaptopUI]) {
      const view = render(<Screen state={initialCycle(0)} />);
      for (const i of [1, 2, 3, 2, 3]) {
        view.rerender(<Screen state={initialCycle(i)} />);
        // The entering business is in the DOM straight away (no waiting for the old one to leave).
        const app = [HERO_SCREENS.cafe, HERO_SCREENS.clinic, HERO_SCREENS.crm, HERO_SCREENS.events][i].app;
        expect(view.container.textContent, `${Screen.name} ${i}`).toContain(app);
      }
      view.unmount();
    }
  });

  it("tags every screen as sample data", async () => {
    stubMedia(["(prefers-reduced-motion: reduce)"]);
    const { PhoneUI, LaptopUI } = await import("@/components/hero/LiveScreens");
    for (let i = 0; i < 4; i++) {
      const phone = render(<PhoneUI state={initialCycle(i)} />);
      expect(phone.container.textContent).toContain("Sample data");
      phone.unmount();
      const laptop = render(<LaptopUI state={initialCycle(i)} />);
      expect(laptop.container.textContent).toContain("Sample data");
      laptop.unmount();
    }
  });
});

describe("the header over the hero", () => {
  it("is see-through at the very top and solid as soon as the page scrolls", async () => {
    const { HeaderShell } = await import("@/components/site/HeaderShell");
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    const { container } = render(<HeaderShell>nav</HeaderShell>);
    const header = () => container.querySelector("header")!;
    expect(header().getAttribute("data-scrolled")).toBe("false");
    Object.defineProperty(window, "scrollY", { value: 1, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header().getAttribute("data-scrolled")).toBe("true");
    expect(header().className).toMatch(/bg-canvas/);
  });
});

describe("the flat device", () => {
  it("stays hidden on a desktop that will get the 3D, so the stage never shows a lone phone first", async () => {
    stubMedia([]);
    stubWebGL(true);
    const { HeroStage } = await import("@/components/hero/HeroStage");
    const { container } = render(<HeroStage />);
    const wrapper = () => container.querySelector("[data-flat-device]")!.parentElement!;
    // Before the check: hidden on wider screens unless "reduce motion" (CSS), shown on phones.
    expect(wrapper().className).toMatch(/sm:motion-safe:opacity-0/);
    act(() => vi.advanceTimersByTime(3000));
    expect(wrapper().className).toMatch(/(^|\s)opacity-0/);
  });

  async function renderStage() {
    const { HeroStage } = await import("@/components/hero/HeroStage");
    const view = render(<HeroStage />);
    // The hero checks the device a tick after mount, then asks for 3D only after load, when idle (jsdom: a timer).
    act(() => vi.advanceTimersByTime(10));
    act(() => vi.advanceTimersByTime(3000));
    return view;
  }

  it("shows for reduce motion: no 3D, no tilt, one still screen", async () => {
    stubMedia(["(prefers-reduced-motion: reduce)"]);
    stubWebGL(true);
    const { container, queryByTestId } = await renderStage();
    expect(container.querySelector("[data-hero-stage]")?.getAttribute("data-hero-stage")).toBe("flat");
    expect(queryByTestId("device-scene")).toBeNull();
    expect(container.querySelector("[data-flat-device]")?.getAttribute("data-tilt")).toBe("off");
    const screen = () => container.querySelector("[data-screen='phone']");
    expect(screen()?.getAttribute("data-vertical")).toBe("cafe");
    const before = screen()?.textContent;
    act(() => vi.advanceTimersByTime(ARRIVE_MS * 10));
    expect(screen()?.getAttribute("data-vertical")).toBe("cafe");
    expect(screen()?.textContent).toBe(before);
  });

  it("shows when the browser has no WebGL, and the 3D is never requested", async () => {
    stubMedia([]);
    stubWebGL(false);
    expect(canRun3D()).toBe(false);
    const { container, queryByTestId } = await renderStage();
    expect(container.querySelector("[data-hero-stage]")?.getAttribute("data-hero-stage")).toBe("flat");
    expect(queryByTestId("device-scene")).toBeNull();
    expect(container.querySelector("[data-flat-device]")).toBeTruthy();
  });

  it("shows on phones, even with WebGL", async () => {
    stubMedia(["(max-width: 640px)"]);
    stubWebGL(true);
    expect(canRun3D()).toBe(false);
    const { queryByTestId } = await renderStage();
    expect(queryByTestId("device-scene")).toBeNull();
  });

  it("gives way to the 3D scene on a capable desktop with WebGL", async () => {
    stubMedia([]);
    stubWebGL(true);
    expect(canRun3D()).toBe(true);
    const { container, queryByTestId } = await renderStage();
    expect(queryByTestId("device-scene")).toBeTruthy();
    expect(container.querySelector("[data-hero-stage]")?.getAttribute("data-hero-stage")).toBe("3d");
  });

  it("keeps the flat device on low-power machines (4 cores or fewer)", () => {
    stubMedia([]);
    stubWebGL(true);
    Object.defineProperty(navigator, "hardwareConcurrency", { value: 4, configurable: true });
    expect(canRun3D()).toBe(false);
  });
});
