import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The visual is tested in tests/visuals.test.tsx; here it is a plain stand-in that shows the blocks it receives.
vi.mock("@/components/visuals", () => ({
  KitBlocks: ({ blocks }: { blocks: readonly string[] }) => <div data-testid="kit-blocks">{blocks.join(",")}</div>,
}));

import { KitBuilder } from "@/components/home/KitBuilder";

class IO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe() {
    this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", IO);

afterEach(cleanup);

describe("kit builder", () => {
  it("suggests blocks for a business, toggles them, and links to the call form with the kit", () => {
    render(<KitBuilder />);
    fireEvent.click(screen.getByLabelText("Cafe and restaurant"));

    const orders = screen.getByRole("button", { name: /Online orders and table bookings/ });
    expect(orders.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("kit-blocks").textContent).toBe("website,orders,ogi,reminders,dashboard");

    fireEvent.click(screen.getByRole("button", { name: /AI assistant/ }));
    fireEvent.click(screen.getByRole("button", { name: /CRM/ }));
    expect(screen.getByTestId("kit-blocks").textContent).toBe("website,orders,crm,reminders,dashboard");

    const link = screen.getByRole("link", { name: "Book a call for this kit" });
    expect(link.getAttribute("href")).toBe("/book?business=cafe&kit=website%2Corders%2Ccrm%2Creminders%2Cdashboard");
    expect(screen.getByText("5 blocks in your kit")).toBeTruthy();
  });

  it("uses native radios and toggle buttons, so it works by keyboard", () => {
    render(<KitBuilder />);
    expect(screen.getAllByRole("radio")).toHaveLength(6);
    for (const button of screen.getAllByRole("button")) expect(button.getAttribute("aria-pressed")).not.toBeNull();
  });
});
