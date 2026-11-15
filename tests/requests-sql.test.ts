// @vitest-environment node
/**
 * db/schema.sql and the Postgres store's SQL on a real Postgres engine: PGlite (Postgres compiled to WebAssembly,
 * in process). No network and no Neon. The store runs the exact statements it sends to Neon in production.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import { REF, REQUEST_ID } from "@/lib/requests/ids";
import { memoryStore, resetMemoryStore } from "@/lib/requests/memory";
import { sqlStore } from "@/lib/requests/postgres";
import { schemaStatements } from "@/lib/requests/schema";
import type { CallRequestStore, NewCallRequest } from "@/lib/requests/types";

const statements = schemaStatements(readFileSync(path.join(process.cwd(), "db/schema.sql"), "utf8"));

async function freshDb() {
  const db = new PGlite();
  for (const s of statements) await db.query(s);
  return db;
}

const storeOn = (db: PGlite) => sqlStore(async (text, params) => (await db.query(text, params)).rows as Record<string, unknown>[]);

const asha: NewCallRequest = {
  name: "Asha Rao",
  business: "cafe",
  contact: "asha@example.com",
  contactKind: "email",
  kit: ["website", "orders", "ogi"],
  preferredTime: "Weekday morning",
  source: "form",
  utm: null,
};
const ravi: NewCallRequest = { ...asha, name: "Ravi K", business: "clinic", contact: "+44 20 7946 0958", contactKind: "phone", kit: [], source: "ogi", utm: { utm_source: "news" } };

describe("db/schema.sql", () => {
  it("splits into the table and two indexes", () => {
    expect(statements).toHaveLength(3);
    expect(statements[0]).toMatch(/^CREATE TABLE IF NOT EXISTS call_requests/);
    expect(statements.slice(1).every((s) => s.startsWith("CREATE INDEX IF NOT EXISTS"))).toBe(true);
  });

  it("runs twice without error and keeps the rows", async () => {
    const db = await freshDb();
    await storeOn(db).create(asha);
    for (const s of statements) await db.query(s);
    const { rows } = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM call_requests");
    expect(rows[0].n).toBe(1);
    const idx = await db.query<{ indexname: string }>("SELECT indexname FROM pg_indexes WHERE tablename = 'call_requests' ORDER BY indexname");
    expect(idx.rows.map((r) => r.indexname)).toEqual(
      expect.arrayContaining(["call_requests_created_at_idx", "call_requests_status_idx", "call_requests_pkey", "call_requests_ref_key"]),
    );
  });

  it("refuses a status outside the five", async () => {
    const db = await freshDb();
    const saved = await storeOn(db).create(asha);
    await expect(db.query("UPDATE call_requests SET status = 'maybe' WHERE id = $1", [saved.id])).rejects.toThrow(/call_requests_status_check/);
    for (const status of ["new", "contacted", "call_done", "won", "lost"]) {
      await db.query("UPDATE call_requests SET status = $1 WHERE id = $2", [status, saved.id]);
    }
  });

  it("refuses an unknown source or contact kind, and a repeated ref", async () => {
    const db = await freshDb();
    const saved = await storeOn(db).create(asha);
    await expect(db.query("UPDATE call_requests SET source = 'fax' WHERE id = $1", [saved.id])).rejects.toThrow(/source_check/);
    await expect(db.query("UPDATE call_requests SET contact_kind = 'fax' WHERE id = $1", [saved.id])).rejects.toThrow(/contact_kind_check/);
    await expect(
      db.query(
        "INSERT INTO call_requests (id, ref, name, business, contact, contact_kind, preferred_time) VALUES ('req_x', $1, 'n', 'cafe', 'c', 'phone', 'Any time')",
        [saved.ref],
      ),
    ).rejects.toThrow(/call_requests_ref_key/);
  });

  it("fills the defaults: status new, empty notes, source form, both timestamps", async () => {
    const db = await freshDb();
    await db.query("INSERT INTO call_requests (id, ref, name, business, contact, contact_kind, preferred_time) VALUES ('req_y', 'OD-ABCDEF', 'n', 'cafe', 'c', 'phone', 'Any time')");
    const { rows } = await db.query<Record<string, unknown>>("SELECT status, notes, source, kit, created_at, updated_at FROM call_requests");
    expect(rows[0]).toMatchObject({ status: "new", notes: "", source: "form", kit: [] });
    expect(rows[0].created_at).toBeInstanceOf(Date);
    expect(rows[0].updated_at).toBeInstanceOf(Date);
  });
});

/** The same behaviour from both stores. */
const stores: [string, () => Promise<CallRequestStore>][] = [
  ["postgres (PGlite)", async () => storeOn(await freshDb())],
  [
    "memory",
    async () => {
      resetMemoryStore();
      return memoryStore;
    },
  ],
];

describe.each(stores)("%s store", (_name, make) => {
  let store: CallRequestStore;
  beforeEach(async () => {
    store = await make();
  });

  it("saves a request with a server id, a short ref and status new", async () => {
    const saved = await store.create(asha);
    expect(saved).toMatchObject({ ...asha, status: "new", notes: "" });
    expect(saved.id).toMatch(REQUEST_ID);
    expect(saved.ref).toMatch(REF);
    expect(new Date(saved.createdAt).getTime()).toBeGreaterThan(Date.now() - 60_000);
  });

  it("keeps the kit as a list and the UTM tags", async () => {
    await store.create(ravi);
    const [row] = await store.list();
    expect(row.kit).toEqual([]);
    expect(row.utm).toEqual({ utm_source: "news" });
    expect(row.source).toBe("ogi");
    const [withKit] = await (await store.create(asha), store.list({ business: "cafe" }));
    expect(withKit.kit).toEqual(["website", "orders", "ogi"]);
  });

  it("lists newest first, and filters by status, business and search", async () => {
    const a = await store.create(asha);
    await new Promise((r) => setTimeout(r, 5));
    const b = await store.create(ravi);
    expect((await store.list()).map((r) => r.id)).toEqual([b.id, a.id]);
    expect((await store.list({ business: "clinic" })).map((r) => r.id)).toEqual([b.id]);
    await store.update(a.id, { status: "contacted" });
    expect((await store.list({ status: "contacted" })).map((r) => r.id)).toEqual([a.id]);
    expect((await store.list({ status: "new", business: "cafe" })).length).toBe(0);
    expect((await store.list({ q: "ASHA" })).map((r) => r.id)).toEqual([a.id]);
    expect((await store.list({ q: "7946" })).map((r) => r.id)).toEqual([b.id]);
    expect((await store.list({ q: "%" })).length).toBe(0);
  });

  it("changes status and notes, and leaves the other alone", async () => {
    const saved = await store.create(asha);
    const one = await store.update(saved.id, { status: "call_done" });
    expect(one).toMatchObject({ status: "call_done", notes: "" });
    const two = await store.update(saved.id, { notes: "Wants online orders by spring." });
    expect(two).toMatchObject({ status: "call_done", notes: "Wants online orders by spring." });
    expect(new Date(two!.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(saved.updatedAt).getTime());
    expect(await store.update("req_00000000000000000000", { status: "won" })).toBeNull();
  });

  it("counts new, this week, this month, won and by business", async () => {
    const a = await store.create(asha);
    const b = await store.create(ravi);
    await store.create({ ...asha, name: "Third" });
    await store.update(a.id, { status: "won" });
    await store.update(b.id, { status: "lost" });
    const now = Date.now();
    const counts = await store.counts({ weekStart: new Date(now - 60_000), monthStart: new Date(now - 60_000) });
    expect(counts).toEqual({ total: 3, new: 1, week: 3, month: 3, won: 1, byBusiness: { cafe: 2, clinic: 1 } });
    const future = await store.counts({ weekStart: new Date(now + 60_000), monthStart: new Date(now - 60_000) });
    expect(future.week).toBe(0);
    expect(future.month).toBe(3);
  });
});
