import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminApp } from "@/components/admin/AdminApp";
import { ADMIN } from "@/components/admin/copy";
import type { CallRequest, RequestCounts } from "@/lib/requests/types";

const asha: CallRequest = {
  id: "req_aaaaaaaaaaaaaaaaaaaa",
  ref: "OD-7K3M9Q",
  createdAt: "2026-11-15T09:30:00.000Z",
  updatedAt: "2026-11-15T09:30:00.000Z",
  name: "Asha Rao",
  business: "cafe",
  contact: "asha@example.com",
  contactKind: "email",
  kit: ["website", "ogi"],
  preferredTime: "Weekday morning",
  source: "form",
  utm: null,
  status: "new",
  notes: "",
};
const ravi: CallRequest = { ...asha, id: "req_bbbbbbbbbbbbbbbbbbbb", ref: "OD-ABCDEF", name: "Ravi K", business: "clinic", contact: "+44 20 7946 0958", contactKind: "phone", kit: [] };
const counts: RequestCounts = { total: 2, new: 2, week: 2, month: 2, won: 0, byBusiness: { cafe: 1, clinic: 1 } };
const none: RequestCounts = { total: 0, new: 0, week: 0, month: 0, won: 0, byBusiness: {} };

type Route = (url: string, init?: RequestInit) => { status: number; body: unknown };

function stubFetch(route: Route) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const { status, body } = route(url, init);
    return { ok: status < 300, status, json: async () => body } as Response;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("/admin", () => {
  it("says admin is not set up when the server answers 503", async () => {
    stubFetch(() => ({ status: 503, body: { ok: false, configured: false } }));
    render(<AdminApp />);
    expect(await screen.findByRole("heading", { name: ADMIN.notSetUp.title })).toBeTruthy();
  });

  it("shows the password form when logged out", async () => {
    const fetch = stubFetch((url) =>
      url.startsWith("/api/admin/login") ? { status: 401, body: { ok: false, error: "Wrong password." } } : { status: 200, body: { ok: true, authed: false } },
    );
    render(<AdminApp />);
    const input = await screen.findByLabelText(ADMIN.login.password);
    expect(input.getAttribute("type")).toBe("password");
    fireEvent.change(input, { target: { value: "guess" } });
    fireEvent.click(screen.getByRole("button", { name: ADMIN.login.submit }));
    expect((await screen.findByRole("alert")).textContent).toBe("Wrong password.");
    expect(fetch.mock.calls.some(([u, i]) => u === "/api/admin/login" && i?.method === "POST")).toBe(true);
  });

  it("shows the empty state when there are no requests yet", async () => {
    stubFetch((url) => (url === "/api/admin/session" ? { status: 200, body: { ok: true, authed: true } } : { status: 200, body: { ok: true, requests: [], counts: none } }));
    render(<AdminApp />);
    expect(await screen.findByText(ADMIN.empty.title)).toBeTruthy();
  });

  it("shows the counts and each request with tap-to-call or email, and saves a status and notes", async () => {
    const fetch = stubFetch((url, init) => {
      if (url === "/api/admin/session") return { status: 200, body: { ok: true, authed: true } };
      if (init?.method === "PATCH") return { status: 200, body: { ok: true, request: { ...asha, ...JSON.parse(String(init.body)) } } };
      return { status: 200, body: { ok: true, storage: "postgres", requests: [ravi, asha], counts } };
    });
    render(<AdminApp />);
    await screen.findByText("Asha Rao");

    const tile = (key: string) => document.querySelector(`[data-count="${key}"] dd`)?.textContent;
    expect([tile("new"), tile("week"), tile("month"), tile("won")]).toEqual(["2", "2", "2", "0"]);
    expect(document.querySelector('[data-business="cafe"]')?.textContent).toContain("1");

    const ashaCard = document.querySelector<HTMLElement>('[data-request="OD-7K3M9Q"]')!;
    const raviCard = document.querySelector<HTMLElement>('[data-request="OD-ABCDEF"]')!;
    expect(within(ashaCard).getByRole("link", { name: /asha@example.com/ }).getAttribute("href")).toBe("mailto:asha@example.com");
    expect(within(raviCard).getByRole("link", { name: /7946/ }).getAttribute("href")).toBe("tel:+442079460958");
    expect(ashaCard.textContent).toContain("Weekday morning");
    expect(ashaCard.textContent).toContain("OD-7K3M9Q");
    expect(ashaCard.textContent).toContain("New");

    fireEvent.click(within(ashaCard).getByRole("button", { name: ADMIN.row.open }));
    fireEvent.change(within(ashaCard).getByLabelText(ADMIN.editor.status), { target: { value: "contacted" } });
    fireEvent.change(within(ashaCard).getByLabelText(ADMIN.editor.notes), { target: { value: "Call back Tuesday." } });
    fireEvent.click(within(ashaCard).getByRole("button", { name: ADMIN.editor.save }));
    await within(ashaCard).findByText(ADMIN.editor.saved);
    const call = fetch.mock.calls.find(([, i]) => i?.method === "PATCH")!;
    expect(call[0]).toBe(`/api/admin/requests/${asha.id}`);
    expect(JSON.parse(String(call[1]?.body))).toEqual({ status: "contacted", notes: "Call back Tuesday." });
  });

  it("sends the filters to the server", async () => {
    const fetch = stubFetch((url) =>
      url === "/api/admin/session" ? { status: 200, body: { ok: true, authed: true } } : { status: 200, body: { ok: true, requests: [asha], counts } },
    );
    render(<AdminApp />);
    await screen.findByText("Asha Rao");
    fireEvent.change(screen.getByLabelText(ADMIN.filters.status), { target: { value: "won" } });
    await waitFor(() => expect(fetch.mock.calls.some(([u]) => u === "/api/admin/requests?status=won")).toBe(true));
  });
});
