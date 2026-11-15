// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/book/route";
import { BOOK_PAGE } from "@/lib/content";
import { resetRateLimits } from "@/lib/ogi/rateLimit";
import { getStore, StoreUnavailableError } from "@/lib/requests";
import { REF } from "@/lib/requests/ids";
import { BOOK_BODY_MAX, BOOK_LIMIT } from "@/lib/requests/input";
import { memoryStore, resetMemoryStore } from "@/lib/requests/memory";

const good = { name: "Asha Rao", business: "cafe", contact: "+44 20 7946 0958", kit: ["ogi", "website"], time: "Weekday morning" };

let ip = 0;
function post(body: unknown, opts: { ip?: string; raw?: string; headers?: Record<string, string> } = {}) {
  return POST(
    new NextRequest("http://localhost/api/book", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": opts.ip ?? `203.0.113.${++ip}`, ...opts.headers },
      body: opts.raw ?? JSON.stringify(body),
    }),
  );
}

let logs: string[] = [];
beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("VERCEL", "");
  resetMemoryStore();
  resetRateLimits();
  logs = [];
  vi.spyOn(console, "info").mockImplementation((...args: unknown[]) => void logs.push(args.join(" ")));
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => void logs.push(args.join(" ")));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/book", () => {
  it("saves a valid request and returns its short reference", async () => {
    const res = await post(good);
    expect(res.status).toBe(201);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = (await res.json()) as { ok: boolean; ref: string };
    expect(body.ok).toBe(true);
    expect(body.ref).toMatch(REF);
    const [saved] = await memoryStore.list();
    expect(saved).toMatchObject({
      ref: body.ref,
      name: "Asha Rao",
      business: "cafe",
      contact: "+44 20 7946 0958",
      contactKind: "phone",
      kit: ["website", "ogi"],
      preferredTime: "Weekday morning",
      source: "form",
      utm: null,
      status: "new",
    });
  });

  it("marks an email contact, Ogi's source and the UTM tags, capped", async () => {
    const res = await post({ ...good, contact: "asha@example.com", source: "ogi", utm: { utm_source: "x".repeat(300), utm_medium: "" } });
    expect(res.status).toBe(201);
    const [saved] = await memoryStore.list();
    expect(saved.contactKind).toBe("email");
    expect(saved.source).toBe("ogi");
    expect(saved.utm).toEqual({ utm_source: "x".repeat(100) });
  });

  it("refuses invalid fields with the form's own messages, and saves nothing", async () => {
    const res = await post({ ...good, name: " ", contact: "call me" });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { ok: boolean; errors: Record<string, string> };
    expect(body.errors).toEqual({ name: BOOK_PAGE.errors.name, contact: BOOK_PAGE.errors.contactInvalid });
    expect(await memoryStore.list()).toHaveLength(0);
  });

  it("refuses an unknown business, block or time", async () => {
    for (const bad of [{ business: "bakery" }, { kit: ["website", "hack"] }, { time: "Midnight" }]) {
      expect((await post({ ...good, ...bad })).status, JSON.stringify(bad)).toBe(400);
    }
    expect(await memoryStore.list()).toHaveLength(0);
  });

  it("refuses extra fields, a status, an unknown source or an unknown UTM key", async () => {
    for (const extra of [{ status: "won" }, { id: "req_x" }, { notes: "hi" }, { source: "admin" }, { utm: { utm_id: "1" } }]) {
      const res = await post({ ...good, ...extra });
      expect(res.status, JSON.stringify(extra)).toBe(400);
      expect(((await res.json()) as { errors?: unknown }).errors).toBeUndefined();
    }
    expect(await memoryStore.list()).toHaveLength(0);
  });

  it("refuses a filled honeypot and saves nothing", async () => {
    const res = await post({ ...good, company_url: "https://spam.example" });
    expect(res.status).toBe(400);
    expect(await memoryStore.list()).toHaveLength(0);
  });

  it("accepts an empty honeypot", async () => {
    expect((await post({ ...good, company_url: "" })).status).toBe(201);
  });

  it("refuses a body that is not JSON, or too big", async () => {
    expect((await post(null, { raw: "{not json" })).status).toBe(400);
    expect((await post(null, { raw: JSON.stringify({ ...good, name: "a".repeat(BOOK_BODY_MAX) }) })).status).toBe(413);
    expect((await post(good, { headers: { "content-length": String(BOOK_BODY_MAX + 1) } })).status).toBe(413);
    expect(await memoryStore.list()).toHaveLength(0);
  });

  it("rate-limits one IP, not the next", async () => {
    for (let i = 0; i < BOOK_LIMIT; i++) expect((await post(good, { ip: "198.51.100.7" })).status).toBe(201);
    expect((await post(good, { ip: "198.51.100.7" })).status).toBe(429);
    expect((await post(good, { ip: "198.51.100.8" })).status).toBe(201);
    expect(await memoryStore.list()).toHaveLength(BOOK_LIMIT + 1);
  });

  it("answers 503 when saving fails, so the form offers email instead", async () => {
    vi.spyOn(memoryStore, "create").mockRejectedValueOnce(Object.assign(new Error('violates check "Asha Rao"'), { code: "23514" }));
    const res = await post(good);
    expect(res.status).toBe(503);
    expect(logs.join("\n")).toContain("save_failed:Error:23514");
  });

  it("never logs the visitor's name, contact or IP", async () => {
    await post({ ...good, contact: "asha@example.com" }, { ip: "192.0.2.55" });
    await post({ ...good, contact: "+44 20 7946 0958" }, { ip: "192.0.2.55" });
    await post({ ...good, name: "" }, { ip: "192.0.2.55" });
    vi.spyOn(memoryStore, "create").mockRejectedValueOnce(new Error("Asha Rao +44 20 7946 0958"));
    await post(good, { ip: "192.0.2.55" });
    const text = logs.join("\n");
    expect(text).toContain("book outcome=saved ref=OD-");
    for (const secret of ["Asha", "asha@example.com", "7946", "192.0.2.55"]) expect(text).not.toContain(secret);
  });
});

describe("the request store", () => {
  it("uses memory without DATABASE_URL, off Vercel", () => {
    expect(getStore({ DATABASE_URL: "" }).kind).toBe("memory");
  });

  it("refuses memory on Vercel, so leads are never kept where they would vanish", async () => {
    expect(() => getStore({ DATABASE_URL: "", VERCEL: "1" })).toThrow(StoreUnavailableError);
    vi.stubEnv("VERCEL", "1");
    expect((await post(good)).status).toBe(503);
  });

  it("makes a Postgres store from DATABASE_URL without connecting", () => {
    // Neon's HTTP driver connects per query, so this makes no network call.
    expect(getStore({ DATABASE_URL: "postgresql://user:pw@db.invalid/neondb" }).kind).toBe("postgres");
  });
});
