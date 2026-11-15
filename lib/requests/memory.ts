import { newRef, newRequestId } from "./ids";
import { LIST_LIMIT, type CallRequest, type CallRequestStore, type ListFilter, type PeriodStarts, type RequestCounts, type RequestPatch } from "./types";

/**
 * Requests kept in memory, for tests and local development without DATABASE_URL. Same behaviour as the
 * Postgres store. Kept on globalThis so a dev-server reload does not empty it. Lost when the process stops.
 */
const g = globalThis as typeof globalThis & { __callRequests?: CallRequest[] };
const rows = () => (g.__callRequests ??= []);

const newestFirst = (a: CallRequest, b: CallRequest) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);

function matches(r: CallRequest, filter: ListFilter) {
  if (filter.status && r.status !== filter.status) return false;
  if (filter.business && r.business !== filter.business) return false;
  const q = filter.q?.trim().toLowerCase();
  if (q && !r.name.toLowerCase().includes(q) && !r.contact.toLowerCase().includes(q)) return false;
  return true;
}

export const memoryStore: CallRequestStore = {
  kind: "memory",

  async create(input) {
    const now = new Date().toISOString();
    const taken = new Set(rows().map((r) => r.ref));
    let ref = newRef();
    while (taken.has(ref)) ref = newRef();
    const row: CallRequest = { id: newRequestId(), ref, createdAt: now, updatedAt: now, status: "new", notes: "", ...input };
    rows().push(row);
    return { ...row };
  },

  async list(filter = {}) {
    return rows()
      .filter((r) => matches(r, filter))
      .sort(newestFirst)
      .slice(0, LIST_LIMIT)
      .map((r) => ({ ...r }));
  },

  async update(id: string, patch: RequestPatch) {
    const row = rows().find((r) => r.id === id);
    if (!row) return null;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.notes !== undefined) row.notes = patch.notes;
    row.updatedAt = new Date().toISOString();
    return { ...row };
  },

  async counts({ weekStart, monthStart }: PeriodStarts) {
    const all = rows();
    const since = (start: Date) => all.filter((r) => new Date(r.createdAt) >= start).length;
    const byBusiness: RequestCounts["byBusiness"] = {};
    for (const r of all) byBusiness[r.business] = (byBusiness[r.business] ?? 0) + 1;
    return {
      total: all.length,
      new: all.filter((r) => r.status === "new").length,
      week: since(weekStart),
      month: since(monthStart),
      won: all.filter((r) => r.status === "won").length,
      byBusiness,
    };
  },
};

/** Tests only. */
export function resetMemoryStore(seed: CallRequest[] = []) {
  g.__callRequests = seed.map((r) => ({ ...r }));
}
