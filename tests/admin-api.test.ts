// @vitest-environment node
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as login } from "@/app/api/admin/login/route";
import { POST as logout } from "@/app/api/admin/logout/route";
import { GET as list } from "@/app/api/admin/requests/route";
import { PATCH } from "@/app/api/admin/requests/[id]/route";
import { GET as session } from "@/app/api/admin/session/route";
import { ADMIN_COOKIE, KEY_LABEL, LOGIN_LIMIT, SESSION_TTL_MS, isAdmin, sessionKey, signSession, verifySession } from "@/lib/admin/auth";
import { resetRateLimits } from "@/lib/ogi/rateLimit";
import { memoryStore, resetMemoryStore } from "@/lib/requests/memory";
import type { CallRequest, NewCallRequest, RequestCounts } from "@/lib/requests/types";

/** A throwaway value for these tests only. The real password lives only in Vercel's environment. */
const TEST_PASSWORD = "test-only-not-a-real-password";

const lead: NewCallRequest = {
  name: "Asha Rao",
  business: "cafe",
  contact: "asha@example.com",
  contactKind: "email",
  kit: ["website"],
  preferredTime: "Any time",
  source: "form",
  utm: null,
};

let ip = 0;
function req(url: string, init: { method?: string; body?: unknown; cookie?: string; ip?: string; contentType?: string } = {}) {
  const headers: Record<string, string> = { "x-forwarded-for": init.ip ?? `203.0.113.${++ip}` };
  if (init.body !== undefined) headers["content-type"] = init.contentType ?? "application/json";
  if (init.cookie !== undefined) headers.cookie = `${ADMIN_COOKIE}=${init.cookie}`;
  return new NextRequest(`http://localhost${url}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : typeof init.body === "string" ? init.body : JSON.stringify(init.body),
  });
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) }) as RouteContext<"/api/admin/requests/[id]">;
const patch = (id: string, body: unknown, cookie?: string) => PATCH(req(`/api/admin/requests/${id}`, { method: "PATCH", body, cookie }), ctx(id));
const goodCookie = () => signSession(TEST_PASSWORD);

beforeEach(() => {
  vi.stubEnv("ADMIN_PASSWORD", TEST_PASSWORD);
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("VERCEL", "");
  resetMemoryStore();
  resetRateLimits();
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("the session cookie", () => {
  it("accepts a fresh cookie and refuses an expired one", () => {
    const now = Date.now();
    const token = signSession(TEST_PASSWORD, now);
    expect(verifySession(token, TEST_PASSWORD, now + 1000)).toBe(true);
    expect(verifySession(token, TEST_PASSWORD, now + SESSION_TTL_MS + 1)).toBe(false);
  });

  it("refuses a forged signature, an edited expiry and junk", () => {
    const token = goodCookie();
    const [v, expiry, sig] = token.split(".");
    const flipped = sig.slice(0, -1) + (sig.endsWith("A") ? "B" : "A");
    expect(verifySession(`${v}.${expiry}.${flipped}`, TEST_PASSWORD)).toBe(false);
    expect(verifySession(`${v}.${Number(expiry) + 60_000}.${sig}`, TEST_PASSWORD)).toBe(false);
    expect(verifySession(`v2.${expiry}.${sig}`, TEST_PASSWORD)).toBe(false);
    for (const junk of ["", "x", "v1..", `v1.${expiry}`, token + "x", token.replace("v1", "V1")]) expect(verifySession(junk, TEST_PASSWORD), junk).toBe(false);
  });

  it("refuses a cookie signed with any other key, including the password itself", () => {
    const expiry = Date.now() + 60_000;
    const payload = `v1.${expiry}`;
    const withPassword = createHmac("sha256", TEST_PASSWORD).update(payload).digest("base64url");
    expect(verifySession(`${payload}.${withPassword}`, TEST_PASSWORD)).toBe(false);
    const withKey = createHmac("sha256", sessionKey(TEST_PASSWORD)).update(payload).digest("base64url");
    expect(verifySession(`${payload}.${withKey}`, TEST_PASSWORD)).toBe(true);
    expect(KEY_LABEL).toBe("onlydevs-admin-v1");
  });

  it("refuses a far-future expiry even with a good signature", () => {
    const token = signSession(TEST_PASSWORD, Date.now(), SESSION_TTL_MS * 10);
    expect(verifySession(token, TEST_PASSWORD)).toBe(false);
  });

  it("logs everyone out when the password changes", () => {
    const token = goodCookie();
    expect(isAdmin(token, { ADMIN_PASSWORD: TEST_PASSWORD })).toBe(true);
    expect(isAdmin(token, { ADMIN_PASSWORD: `${TEST_PASSWORD}-new` })).toBe(false);
    expect(isAdmin(token, {})).toBe(false);
  });
});

describe("admin login", () => {
  it("gives 401 for a wrong, empty or missing password, and sets no cookie", async () => {
    for (const body of [{ password: "wrong" }, { password: "" }, {}, { password: 123 }, "not json"]) {
      const res = await login(req("/api/admin/login", { method: "POST", body }));
      expect(res.status, JSON.stringify(body)).toBe(401);
      expect(res.headers.get("set-cookie")).toBeNull();
      resetRateLimits();
    }
  });

  it("sets an httpOnly, SameSite=Strict, 7-day signed cookie for the right password", async () => {
    const res = await login(req("/api/admin/login", { method: "POST", body: { password: TEST_PASSWORD } }));
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(new RegExp(`^${ADMIN_COOKIE}=v1\\.\\d{13}\\.[A-Za-z0-9_-]{43};`));
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toMatch(/Max-Age=604800/);
    expect(cookie).not.toMatch(/Secure/i);
    expect(cookie).not.toContain(TEST_PASSWORD);
    const token = cookie.split(";")[0].split("=")[1];
    expect(verifySession(token, TEST_PASSWORD)).toBe(true);
  });

  it("marks the cookie Secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const res = await login(req("/api/admin/login", { method: "POST", body: { password: TEST_PASSWORD } }));
    expect(res.headers.get("set-cookie")).toMatch(/Secure/i);
  });

  it("is rate-limited per IP, even for the right password", async () => {
    for (let i = 0; i < LOGIN_LIMIT; i++) {
      expect((await login(req("/api/admin/login", { method: "POST", body: { password: "guess" }, ip: "198.51.100.9" }))).status).toBe(401);
    }
    expect((await login(req("/api/admin/login", { method: "POST", body: { password: TEST_PASSWORD }, ip: "198.51.100.9" }))).status).toBe(429);
    expect((await login(req("/api/admin/login", { method: "POST", body: { password: TEST_PASSWORD }, ip: "198.51.100.10" }))).status).toBe(200);
  });

  it("wants JSON", async () => {
    const res = await login(req("/api/admin/login", { method: "POST", body: `password=${TEST_PASSWORD}`, contentType: "application/x-www-form-urlencoded" }));
    expect(res.status).toBe(415);
  });

  it("logout clears the cookie", async () => {
    const res = await logout(req("/api/admin/logout", { method: "POST", cookie: goodCookie() }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(new RegExp(`^${ADMIN_COOKIE}=;.*Max-Age=0`, "i"));
  });
});

describe("admin APIs need a session", () => {
  it("give 401 with no cookie, a forged cookie or an expired cookie", async () => {
    const [v, expiry, sig] = goodCookie().split(".");
    const expired = signSession(TEST_PASSWORD, Date.now() - SESSION_TTL_MS - 1000);
    for (const cookie of [undefined, "", `${v}.${expiry}.${sig.replace(/^./, sig[0] === "a" ? "b" : "a")}`, `${v}.${Number(expiry) + 1}.${sig}`, expired]) {
      expect((await list(req("/api/admin/requests", { cookie }))).status, String(cookie)).toBe(401);
      expect((await patch("req_00000000000000000000", { status: "won" }, cookie)).status, String(cookie)).toBe(401);
    }
  });

  it("session says logged out or in", async () => {
    expect(await (await session(req("/api/admin/session"))).json()).toMatchObject({ configured: true, authed: false });
    expect(await (await session(req("/api/admin/session", { cookie: goodCookie() }))).json()).toMatchObject({ configured: true, authed: true });
  });

  it("send no-store and noindex", async () => {
    const res = await list(req("/api/admin/requests", { cookie: goodCookie() }));
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });
});

describe("without ADMIN_PASSWORD", () => {
  it("every admin API answers 503, even with a cookie that was once good", async () => {
    const cookie = goodCookie();
    vi.stubEnv("ADMIN_PASSWORD", "");
    const responses = await Promise.all([
      session(req("/api/admin/session", { cookie })),
      login(req("/api/admin/login", { method: "POST", body: { password: "" } })),
      login(req("/api/admin/login", { method: "POST", body: { password: TEST_PASSWORD } })),
      logout(req("/api/admin/logout", { method: "POST", cookie })),
      list(req("/api/admin/requests", { cookie })),
      patch("req_00000000000000000000", { status: "won" }, cookie),
    ]);
    for (const res of responses) {
      expect(res.status).toBe(503);
      expect(await res.json()).toMatchObject({ configured: false });
    }
  });
});

describe("the list and counts", () => {
  it("lists newest first with the counts, and filters", async () => {
    const a = await memoryStore.create(lead);
    await new Promise((r) => setTimeout(r, 5));
    const b = await memoryStore.create({ ...lead, name: "Ravi", business: "clinic", contact: "+44 20 7946 0958", contactKind: "phone" });
    await memoryStore.update(a.id, { status: "won" });

    const res = await list(req("/api/admin/requests", { cookie: goodCookie() }));
    const body = (await res.json()) as { requests: CallRequest[]; counts: RequestCounts; storage: string };
    expect(body.storage).toBe("memory");
    expect(body.requests.map((r) => r.id)).toEqual([b.id, a.id]);
    expect(body.counts).toEqual({ total: 2, new: 1, week: 2, month: 2, won: 1, byBusiness: { cafe: 1, clinic: 1 } });

    const filtered = (await (await list(req("/api/admin/requests?status=won&business=&q=asha", { cookie: goodCookie() }))).json()) as {
      requests: CallRequest[];
      counts: RequestCounts;
    };
    expect(filtered.requests.map((r) => r.id)).toEqual([a.id]);
    expect(filtered.counts.total).toBe(2);
  });

  it("gives 400 for unknown filters", async () => {
    for (const q of ["?status=maybe", "?business=bakery", "?sort=name", `?q=${"a".repeat(81)}`]) {
      expect((await list(req(`/api/admin/requests${q}`, { cookie: goodCookie() }))).status, q).toBe(400);
    }
  });
});

describe("PATCH /api/admin/requests/[id]", () => {
  it("changes the status and the notes", async () => {
    const saved = await memoryStore.create(lead);
    const one = await patch(saved.id, { status: "contacted" }, goodCookie());
    expect(one.status).toBe(200);
    expect(((await one.json()) as { request: CallRequest }).request).toMatchObject({ status: "contacted", notes: "" });
    const two = await patch(saved.id, { notes: "Call back Tuesday." }, goodCookie());
    expect(((await two.json()) as { request: CallRequest }).request).toMatchObject({ status: "contacted", notes: "Call back Tuesday." });
    const [row] = await memoryStore.list();
    expect(row).toMatchObject({ status: "contacted", notes: "Call back Tuesday." });
  });

  it("gives 400 for a bad status, extra fields, too-long notes or nothing to change", async () => {
    const saved = await memoryStore.create(lead);
    for (const body of [{ status: "maybe" }, { status: "won", name: "x" }, { notes: "a".repeat(4001) }, {}, { status: null }, "nope"]) {
      expect((await patch(saved.id, body, goodCookie())).status, JSON.stringify(body)).toBe(400);
    }
    expect((await memoryStore.list())[0].status).toBe("new");
  });

  it("gives 404 for an unknown or malformed id", async () => {
    expect((await patch("req_00000000000000000000", { status: "won" }, goodCookie())).status).toBe(404);
    expect((await patch("../../etc", { status: "won" }, goodCookie())).status).toBe(404);
  });

  it("gives 401 without a session, and changes nothing", async () => {
    const saved = await memoryStore.create(lead);
    expect((await patch(saved.id, { status: "won" })).status).toBe(401);
    expect((await memoryStore.list())[0].status).toBe("new");
  });
});
