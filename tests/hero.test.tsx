import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ARRIVALS_PER_VERTICAL,
  ARRIVE_MS,
  HERO_ORDER,
  PIN_HEIGHT_SVH,
  TURN_FOR_VERTICAL,
  cycleReducer,
  initialCycle,
  stepFromProgress,
  verticalLabel,
} from "@/components/hero/cycle";
import { FRAMING, POSES, pixelsPerUnit, poseAt } from "@/components/hero/choreography";
import { POSTER } from "@/components/hero/poster";
import { canRun3D, resetWebGLProbe } from "@/components/hero/env";
import { HERO_SCREENS } from "@/components/visuals/sample";
import { HERO } from "@/lib/content";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

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
      "Paper orders → online orders.",
      "Forgotten visits → reminded.",
      "Lost leads → followed up.",
      "Missed calls → answered.",
    ]);
  });

  it("renders the first turn on first paint, then moves to the next", async () => {
    stubMedia([]);
    const { HeadlineTurns, TURN_MS } = await import("@/components/hero/HeadlineTurns");
    const { container } = render(<HeadlineTurns turns={HERO.turns} />);
    const active = () => container.querySelector("[data-active-turn]")?.textContent?.replace(/\s+/g, " ").trim();
    expect(active()).toBe("Paper orders → online orders.");
    // Screen readers get every turn once, as plain text.
    expect(container.querySelector(".sr-only")?.textContent).toBe(
      "Paper orders, online orders. Forgotten visits, reminded. Lost leads, followed up. Missed calls, answered.",
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

describe("the pinned hero (desktops and tablets)", () => {
  it("centres each business on its own pose (0, 25, 50, 75%) and switches half-way between, in order", () => {
    const at = (p: number) => HERO_ORDER[stepFromProgress(p)];
    expect([0, 0.12, 0.13, 0.25, 0.37, 0.38, 0.5, 0.63, 0.75, 1].map(at)).toEqual([
      "cafe",
      "cafe",
      "clinic",
      "clinic",
      "clinic",
      "crm",
      "crm",
      "events",
      "events",
      "events",
    ]);
    expect(stepFromProgress(-1)).toBe(0);
    expect(stepFromProgress(2)).toBe(3);
  });

  it("holds each pose around its point, moves smoothly between, and ends on a wide shot", () => {
    const same = (a: ReturnType<typeof poseAt>, b: ReturnType<typeof poseAt>) => {
      for (const key of ["azimuth", "elevation", "distance", "screenX", "laptopRotationY", "laptopDim"] as const) expect(a[key]).toBeCloseTo(b[key], 9);
      a.phonePosition.forEach((v, j) => expect(v).toBeCloseTo(b.phonePosition[j], 9));
    };
    for (const [i, p] of [0, 0.25, 0.5, 0.75, 1].entries()) {
      same(poseAt(p), POSES[i]);
      // Held a little either side.
      same(poseAt(Math.max(0, p - 0.02)), POSES[i]);
      same(poseAt(Math.min(1, p + 0.02)), POSES[i]);
    }
    // Mid-move: between the two poses.
    const mid = poseAt(0.125);
    expect(mid.azimuth).toBeGreaterThan(POSES[0].azimuth);
    expect(mid.azimuth).toBeLessThan(POSES[1].azimuth);
    // No overshoot anywhere (eased in and out, no bounce): azimuth stays within its neighbours' range.
    for (let p = 0; p <= 1; p += 0.005) {
      const k = Math.min(3, Math.floor(p * 4));
      const lo = Math.min(POSES[k].azimuth, POSES[k + 1].azimuth);
      const hi = Math.max(POSES[k].azimuth, POSES[k + 1].azimuth);
      const a = poseAt(p).azimuth;
      expect(a).toBeGreaterThanOrEqual(lo - 1e-9);
      expect(a).toBeLessThanOrEqual(hi + 1e-9);
    }
  });

  it("makes every step a distinct shot: camera angle, distance, focus and device placement all change", () => {
    const [cafe, clinic, crm, events, wide] = POSES;
    // Clinic swings one way and makes the phone the hero; CRM swings the other way onto the laptop.
    expect(Math.sign(clinic.azimuth)).toBe(-Math.sign(crm.azimuth));
    expect(Math.abs(clinic.azimuth - crm.azimuth)).toBeGreaterThanOrEqual(50);
    expect(clinic.focus.phone).toBe(1);
    expect(clinic.laptopDim).toBeGreaterThan(0.5);
    expect(crm.focus.laptop).toBe(1);
    expect(crm.distance).toBeLessThan(0.7);
    // Events is the lowest angle; the release is the widest.
    expect(events.elevation).toBeLessThan(Math.min(cafe.elevation, clinic.elevation, crm.elevation));
    expect(wide.distance).toBeGreaterThan(cafe.distance);
    // The phone moves for every step.
    const phones = POSES.slice(0, 4).map((p) => p.phonePosition.join(","));
    expect(new Set(phones).size).toBe(4);
  });

  it("lets the scroll pick the business: items still arrive, but the screen never moves on by itself", () => {
    let s = cycleReducer(initialCycle(), { type: "goto", index: 2 });
    expect(HERO_ORDER[s.index]).toBe("crm");
    for (let i = 0; i < 12; i++) s = cycleReducer(s, { type: "tick", advance: false });
    expect(HERO_ORDER[s.index]).toBe("crm");
    expect(s.arrivals).toBe(HERO_SCREENS.crm.incoming.length);
    expect(new Set(s.items.map((item) => item.id)).size).toBe(s.items.length);
  });

  it("pairs each business with its headline turn, all four different", () => {
    const turns = HERO_ORDER.map((id) => HERO.turns[TURN_FOR_VERTICAL[id]].from);
    expect(turns).toEqual(["Paper orders", "Forgotten visits", "Lost leads", "Missed calls"]);
  });

  it("is a tall section with a sticky one-screen stage, in CSS (no jump), for wider screens with motion allowed", () => {
    const frames = readFileSync(resolve(process.cwd(), "components/home/frames.tsx"), "utf8");
    expect(frames).toContain(`sm:motion-safe:h-[${PIN_HEIGHT_SVH}svh]`);
    expect(frames).toContain("sm:motion-reduce:h-svh");
    expect(frames).toMatch(/stageClassName="[^"]*sm:sticky sm:top-0 sm:h-svh/);
    // overflow: hidden on the section would break the sticky stage; clip does not.
    expect(frames).toMatch(/className="relative -mt-16 overflow-clip/);
  });

  it("pins on a wide screen and syncs the headline with the business on screen", async () => {
    stubMedia(["(min-width: 40rem)"]);
    stubWebGL(false);
    const { HeroFrame } = await import("@/components/home/frames");
    const { container } = render(<HeroFrame />);
    act(() => vi.advanceTimersByTime(400));
    expect(container.querySelector("section")?.getAttribute("data-pinned")).toBe("true");
    expect(container.querySelector("[data-active-turn]")?.textContent?.replace(/\s+/g, " ").trim()).toBe("Paper orders → online orders.");
    // While pinned, time alone never changes the business or the headline.
    act(() => vi.advanceTimersByTime(ARRIVE_MS * 8));
    expect(container.querySelector("[data-screen='phone']")?.getAttribute("data-vertical")).toBe("cafe");
    expect(container.querySelector("[data-active-turn]")?.textContent).toContain("Paper orders");
  });

  it("does not pin for reduce motion or on phones", async () => {
    for (const media of [["(min-width: 40rem)", "(prefers-reduced-motion: reduce)"], ["(max-width: 640px)"]]) {
      stubMedia(media);
      stubWebGL(false);
      const { HeroFrame } = await import("@/components/home/frames");
      const { container, unmount } = render(<HeroFrame />);
      expect(container.querySelector("section")?.getAttribute("data-pinned")).toBe("false");
      unmount();
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

  it("is solid straight away when the page loads already scrolled (a reload restores the position, no scroll event)", async () => {
    const { HeaderShell } = await import("@/components/site/HeaderShell");
    Object.defineProperty(window, "scrollY", { value: 400, configurable: true });
    const { container } = render(<HeaderShell>nav</HeaderShell>);
    expect(container.querySelector("header")?.getAttribute("data-scrolled")).toBe("true");
  });

  it("re-reads the position on pageshow, when scroll restoration lands after mount", async () => {
    const { HeaderShell } = await import("@/components/site/HeaderShell");
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    const { container } = render(<HeaderShell>nav</HeaderShell>);
    act(() => vi.advanceTimersByTime(400));
    expect(container.querySelector("header")?.getAttribute("data-scrolled")).toBe("false");
    Object.defineProperty(window, "scrollY", { value: 400, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });
    expect(container.querySelector("header")?.getAttribute("data-scrolled")).toBe("true");
  });
});

describe("the poster and the flat device", () => {
  const flatWrapper = (c: HTMLElement) => c.querySelector("[data-flat-wrapper]")!;
  const poster = (c: HTMLElement) => c.querySelector("[data-hero-poster]")!;

  it("shows the poster (not a lone flat phone) on a desktop that will get the 3D, from the first paint", async () => {
    stubMedia([]);
    stubWebGL(true);
    const { HeroStage } = await import("@/components/hero/HeroStage");
    const { container } = render(<HeroStage />);
    // Before the check: CSS shows the poster on wider screens with motion allowed, and the flat device only elsewhere.
    expect(poster(container).getAttribute("class")).toMatch(/sm:motion-safe:block/);
    expect(flatWrapper(container).className).toMatch(/sm:motion-safe:hidden/);
    act(() => vi.advanceTimersByTime(10));
    act(() => vi.advanceTimersByTime(1500));
    expect(flatWrapper(container).className).toMatch(/(^|\s)hidden/);
    expect(poster(container).getAttribute("class")).not.toMatch(/hidden!/);
  });

  it("keeps the poster, never the flat phone, when the 3D has not drawn after 8 s", async () => {
    stubMedia([]);
    stubWebGL(true);
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    const { HeroStage } = await import("@/components/hero/HeroStage");
    const { container, queryByTestId } = render(<HeroStage />);
    act(() => vi.advanceTimersByTime(10));
    act(() => vi.advanceTimersByTime(1000));
    expect(queryByTestId("device-scene")).toBeTruthy();
    act(() => vi.advanceTimersByTime(9000));
    expect(container.querySelector("[data-hero-stage]")?.getAttribute("data-hero-stage")).toBe("poster");
    expect(queryByTestId("device-scene")).toBeNull();
    expect(flatWrapper(container).className).toMatch(/(^|\s)hidden/);
    expect(poster(container).getAttribute("class")).not.toMatch(/hidden!|opacity-0/);
  });

  it("keeps the poster on a low-power desktop that has WebGL (4 cores or fewer)", async () => {
    stubMedia([]);
    stubWebGL(true);
    Object.defineProperty(navigator, "hardwareConcurrency", { value: 4, configurable: true });
    expect(canRun3D()).toBe(false);
    const { container, queryByTestId } = await renderStage();
    expect(container.querySelector("[data-hero-stage]")?.getAttribute("data-hero-stage")).toBe("poster");
    expect(queryByTestId("device-scene")).toBeNull();
    expect(flatWrapper(container).className).toMatch(/(^|\s)hidden/);
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

  it("shows the flat device when the browser has no WebGL, hides the poster, and never asks for the 3D", async () => {
    stubMedia([]);
    stubWebGL(false);
    expect(canRun3D()).toBe(false);
    const { container, queryByTestId } = await renderStage();
    expect(container.querySelector("[data-hero-stage]")?.getAttribute("data-hero-stage")).toBe("flat");
    expect(queryByTestId("device-scene")).toBeNull();
    expect(flatWrapper(container).className).not.toMatch(/(^|\s)hidden/);
    expect(poster(container).getAttribute("class")).toMatch(/hidden!/);
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

});

describe("the poster file (npm run hero:poster)", () => {
  it("matches the scene's framing and the Cafe pose, so it lines up with the live canvas", () => {
    expect(POSTER.wide.ppu).toBeCloseTo(pixelsPerUnit(POSTER.wide.ref.width, POSTER.wide.ref.height), 6);
    expect(POSTER.tall.ppu).toBeCloseTo(pixelsPerUnit(POSTER.tall.ref.width, POSTER.tall.ref.height), 6);
    expect(POSTER.wide.ref.width / POSTER.wide.ref.height).toBeGreaterThanOrEqual(FRAMING.wide.minAspect);
    expect(POSTER.tall.ref.width / POSTER.tall.ref.height).toBeLessThan(FRAMING.wide.minAspect);
    const cafe = POSES[0];
    expect(POSTER.wide.focus.x).toBeCloseTo(((1 + cafe.screenX) / 2) * POSTER.wide.ref.width, 3);
    expect(POSTER.wide.focus.y).toBeCloseTo(((1 - cafe.screenY) / 2) * POSTER.wide.ref.height, 3);
    expect(POSTER.tall.focus.y).toBeCloseTo(((1 - (cafe.screenY + FRAMING.tall.shiftY)) / 2) * POSTER.tall.ref.height, 3);
  });

  it("exists in public/ and stays small", () => {
    for (const shot of [POSTER.wide, POSTER.tall]) {
      const file = resolve(process.cwd(), "public", shot.src.replace(/^\//, ""));
      const bytes = statSync(file).size;
      expect(bytes).toBe(shot.bytes);
      expect(bytes).toBeLessThan(80 * 1024);
    }
  });
});
