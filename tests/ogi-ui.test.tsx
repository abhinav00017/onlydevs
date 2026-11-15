import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CTA, PRODUCTS } from "@/lib/content";
import { SITE } from "@/lib/site";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

import { BUTTON_PLACE, OgiLauncher } from "@/components/ogi/OgiLauncher";

const COPY = PRODUCTS.ogi.chat;

function stubFetch(handler: (url: string, init?: RequestInit) => unknown) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => ({ json: async () => handler(url, init) }) as Response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  nav.pathname = "/";
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const openButton = () => screen.getByRole("button", { name: COPY.open });

describe("Ogi chat button", () => {
  it("shows plush Ogi on a white circle, never on solid purple", () => {
    stubFetch(() => ({}));
    render(<OgiLauncher />);
    const button = openButton();
    for (const c of ["fixed", "size-14", "rounded-full", "bg-card"]) expect(button.className.split(/\s+/), c).toContain(c);
    expect(button.className.split(/\s+/)).not.toContain("bg-brand");
    expect(button.querySelector("img")?.getAttribute("src")).toBe("/brand/ogi.svg");
  });

  it("uses only the plain Ogi image in the chat code, never an accessory version", () => {
    const dir = resolve(process.cwd(), "components/ogi");
    for (const file of readdirSync(dir)) {
      const text = readFileSync(resolve(dir, file), "utf8");
      expect(text, file).not.toMatch(/ogi-(clinic|cafe|realestate|owner)\.svg/);
    }
  });

  it("sits above the sticky bottom bar, which is 3.5rem tall plus its border", () => {
    // If the bar's height changes, move the button: this test reads the bar's own classes.
    const bar = readFileSync(resolve(process.cwd(), "components/site/BottomBar.tsx"), "utf8");
    expect(bar).toMatch(/fixed inset-x-0 bottom-0/);
    expect(bar).toMatch(/\bh-14\b/);
    expect(bar).toMatch(/border-t\b/);
    expect(BUTTON_PLACE).toContain("bottom-[calc(4.5rem+1px+env(safe-area-inset-bottom))]");
    stubFetch(() => ({}));
    render(<OgiLauncher />);
    expect(openButton().className).toContain(BUTTON_PLACE);
  });

  it("hides on /book, where the form is the action", () => {
    nav.pathname = "/book";
    stubFetch(() => ({}));
    const { container } = render(<OgiLauncher />);
    expect((container.querySelector("[data-ogi]") as HTMLElement).hidden).toBe(true);
  });

  it("loads the panel only when opened", async () => {
    const fetchFn = stubFetch(() => ({ ok: true, awake: false }));
    render(<OgiLauncher />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
    fireEvent.click(openButton());
    expect(await screen.findByRole("dialog", { name: COPY.title })).toBeTruthy();
    expect(fetchFn).toHaveBeenCalledWith("/api/ogi/chat?page=onlydevs", expect.anything());
  });
});

describe("Ogi chat panel", () => {
  it("opens with the keyboard, shows 'Ogi is resting' with the email when no key is set, and Escape gives focus back", async () => {
    stubFetch(() => ({ ok: true, awake: false, email: SITE.email }));
    render(<OgiLauncher />);
    const button = openButton();
    button.focus();
    fireEvent.click(button);
    expect(await screen.findByText(COPY.restingTitle)).toBeTruthy();
    const dialog = screen.getByRole("dialog", { name: COPY.title });
    expect(dialog.querySelector(`a[href="mailto:${SITE.email}"]`)).toBeTruthy();
    expect(dialog.textContent).toContain(COPY.disclaimer);
    expect(COPY.disclaimer).toBe("Ogi is an AI assistant and can make mistakes.");
    expect(button.getAttribute("aria-expanded")).toBe("true");
    // Focus moved into the panel; Escape closes it and gives focus back to the button.
    await waitFor(() => expect(document.activeElement?.textContent).toContain(COPY.close));
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("greets, chats, and shows book_call's result as a Book a free call button to /book with the kit", async () => {
    const href = "/book?business=cafe&kit=website%2Corders%2Cogi";
    const fetchFn = stubFetch((url) => {
      if (url.startsWith("/api/ogi/chat?")) return { ok: true, awake: true, greeting: COPY.greeting };
      if (url === "/api/ogi/chat") return { ok: true, kind: "answer", reply: "Here is your button. See /pricing too.", book: { href, label: CTA.book, kind: "Cafe and restaurant", blocks: ["Website with your menu"] } };
      return {};
    });
    render(<OgiLauncher />);
    fireEvent.click(openButton());
    const input = await screen.findByLabelText(COPY.inputLabel);
    await waitFor(() => expect((input as HTMLTextAreaElement).disabled).toBe(false));
    expect(screen.getByText(COPY.greeting)).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(input));
    fireEvent.change(input, { target: { value: "Book a call for my cafe" } });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });
    const link = await screen.findByRole("link", { name: new RegExp(CTA.book) });
    expect(link.getAttribute("href")).toBe(href);
    expect(screen.getByRole("link", { name: "/pricing" }).getAttribute("href")).toBe("/pricing");
    const sent = JSON.parse(fetchFn.mock.calls.find((c) => c[0] === "/api/ogi/chat")![1]!.body as string);
    expect(sent).toEqual({ page: "onlydevs", messages: [{ role: "user", content: "Book a call for my cafe" }] });
  });

  it("never turns a link outside /book into the booking button", async () => {
    stubFetch((url) => {
      if (url.startsWith("/api/ogi/chat?")) return { ok: true, awake: true, greeting: COPY.greeting };
      return { ok: true, kind: "answer", reply: "Here you go.", book: { href: "https://evil.example/book", label: CTA.book, kind: "Clinic", blocks: [] } };
    });
    render(<OgiLauncher />);
    fireEvent.click(openButton());
    const input = await screen.findByLabelText(COPY.inputLabel);
    await waitFor(() => expect((input as HTMLTextAreaElement).disabled).toBe(false));
    fireEvent.change(input, { target: { value: "book" } });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });
    expect(await screen.findByText("Here you go.")).toBeTruthy();
    expect(screen.queryByRole("link", { name: new RegExp(CTA.book) })).toBeNull();
  });
});
