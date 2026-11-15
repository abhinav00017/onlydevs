import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BOOK_PAGE } from "@/lib/content";
import { SITE } from "@/lib/site";

const nav = vi.hoisted(() => ({ search: "" }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(nav.search), usePathname: () => "/book" }));

import { BookForm, BookFormFromUrl, originFromSearchParams } from "@/components/book/BookForm";

type Reply = { status: number; body?: unknown } | "offline";

function stubFetch(reply: Reply) {
  // The parameters type the calls the tests read back.
  const fn = vi.fn(async (...call: [url: string, init?: RequestInit]) => {
    void call;
    if (reply === "offline") throw new TypeError("Failed to fetch");
    return { ok: reply.status >= 200 && reply.status < 300, status: reply.status, json: async () => reply.body ?? {} } as Response;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function fill() {
  fireEvent.change(screen.getByLabelText(BOOK_PAGE.fields.name.label), { target: { value: "Asha Rao" } });
  fireEvent.change(screen.getByLabelText(BOOK_PAGE.fields.business.label), { target: { value: "cafe" } });
  fireEvent.change(screen.getByLabelText(BOOK_PAGE.fields.contact.label), { target: { value: "asha@example.com" } });
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: BOOK_PAGE.submit }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  nav.search = "";
});

describe("the call form", () => {
  it("saves the request and shows the calm success state with the reference", async () => {
    const fetch = stubFetch({ status: 201, body: { ok: true, ref: "OD-7K3M9Q" } });
    render(<BookForm initial={{ business: "cafe", blocks: ["website", "ogi"] }} />);
    fill();
    submit();
    const done = await screen.findByRole("status");
    expect(done.textContent).toContain("We got your request.");
    expect(done.textContent).toContain("We'll get back to you within one working day.");
    expect(done.textContent).toContain("OD-7K3M9Q");
    expect(screen.queryByRole("form")).toBeNull();

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/book");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      name: "Asha Rao",
      business: "cafe",
      contact: "asha@example.com",
      kit: ["website", "ogi"],
      time: BOOK_PAGE.times[0],
      source: "form",
      company_url: "",
    });
  });

  it("does not call the server when a field is wrong", async () => {
    const fetch = stubFetch({ status: 201, body: { ok: true, ref: "OD-7K3M9Q" } });
    render(<BookForm />);
    submit();
    expect(await screen.findByText(BOOK_PAGE.errorsTitle)).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  for (const [label, reply] of [
    ["the server fails (503)", { status: 503, body: { ok: false, error: "unavailable" } }],
    ["the server errors (500) with no JSON", { status: 500 }],
    ["the network is down", "offline"],
    ["the request is refused without field errors", { status: 400, body: { ok: false, error: "invalid" } }],
    ["the visitor is rate-limited", { status: 429, body: { ok: false } }],
  ] as [string, Reply][]) {
    it(`offers "Email us instead" with the prefilled email when ${label}`, async () => {
      stubFetch(reply);
      render(<BookForm initial={{ business: "cafe", blocks: ["website"] }} />);
      fill();
      submit();
      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toContain(BOOK_PAGE.failTitle);
      const link = screen.getByRole("link", { name: BOOK_PAGE.emailInstead });
      const href = link.getAttribute("href") ?? "";
      expect(href.startsWith(`mailto:${SITE.email}?subject=`)).toBe(true);
      const body = decodeURIComponent(href.split("&body=")[1]);
      expect(body).toContain("Name: Asha Rao");
      expect(body).toContain("Phone or email: asha@example.com");
      // The form keeps what the visitor typed, so they can try again.
      expect((screen.getByLabelText(BOOK_PAGE.fields.name.label) as HTMLInputElement).value).toBe("Asha Rao");
      expect(screen.getByRole("button", { name: BOOK_PAGE.submit })).toBeTruthy();
    });
  }

  it("shows the server's field errors instead of the fallback", async () => {
    stubFetch({ status: 400, body: { ok: false, errors: { contact: BOOK_PAGE.errors.contactInvalid } } });
    render(<BookForm />);
    fill();
    submit();
    await screen.findByText(BOOK_PAGE.errorsTitle);
    expect(screen.queryByRole("link", { name: BOOK_PAGE.emailInstead })).toBeNull();
  });

  it("sends a filled honeypot, so the server can refuse it", async () => {
    const fetch = stubFetch({ status: 400, body: { ok: false } });
    const { container } = render(<BookForm />);
    fill();
    const trap = container.querySelector<HTMLInputElement>('input[name="company_url"]')!;
    expect(trap.tabIndex).toBe(-1);
    expect(trap.closest("[aria-hidden='true']")).not.toBeNull();
    trap.value = "https://spam.example";
    submit();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body)).company_url).toBe("https://spam.example");
  });
});

describe("the kit prefill from the URL", () => {
  it("still fills the business and kit from Ogi's book_call link, and sends source and UTM tags", async () => {
    nav.search = "business=clinic&kit=website,reminders&source=ogi&utm_source=news&utm_campaign=spring";
    const fetch = stubFetch({ status: 201, body: { ok: true, ref: "OD-ABCDEF" } });
    render(<BookFormFromUrl />);
    expect((screen.getByLabelText(BOOK_PAGE.fields.business.label) as HTMLSelectElement).value).toBe("clinic");
    const checked = screen.getAllByRole("checkbox").filter((c) => (c as HTMLInputElement).checked);
    expect(checked.map((c) => (c as HTMLInputElement).value)).toEqual(["website", "reminders"]);
    fireEvent.change(screen.getByLabelText(BOOK_PAGE.fields.name.label), { target: { value: "Ravi" } });
    fireEvent.change(screen.getByLabelText(BOOK_PAGE.fields.contact.label), { target: { value: "+44 20 7946 0958" } });
    submit();
    await screen.findByRole("status");
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toMatchObject({
      business: "clinic",
      kit: ["website", "reminders"],
      source: "ogi",
      utm: { utm_source: "news", utm_campaign: "spring" },
    });
  });

  it("treats any other source as the form, and caps UTM values", () => {
    expect(originFromSearchParams(new URLSearchParams("source=admin"))).toEqual({ source: "form" });
    expect(originFromSearchParams(new URLSearchParams(`utm_medium=${"m".repeat(300)}`)).utm?.utm_medium).toHaveLength(100);
  });
});
