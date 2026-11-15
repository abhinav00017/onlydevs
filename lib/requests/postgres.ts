import type { BlockId, BusinessId } from "@/lib/kit";
import { newRef, newRequestId } from "./ids";
import {
  LIST_LIMIT,
  type CallRequest,
  type CallRequestStore,
  type ContactKind,
  type ListFilter,
  type PeriodStarts,
  type RequestCounts,
  type RequestPatch,
  type RequestSource,
  type RequestStatus,
  type Utm,
} from "./types";

/**
 * Runs one parameterised statement and returns its rows. In production this is Neon's HTTP driver
 * (lib/requests/index.ts); the tests pass PGlite, so the same SQL runs on a real Postgres engine.
 */
export type Query = (text: string, params: unknown[]) => Promise<Record<string, unknown>[]>;

const COLUMNS = "id, ref, created_at, updated_at, name, business, contact, contact_kind, kit, preferred_time, source, utm, status, notes";

type Row = {
  id: string;
  ref: string;
  created_at: Date | string;
  updated_at: Date | string;
  name: string;
  business: BusinessId;
  contact: string;
  contact_kind: ContactKind;
  kit: BlockId[] | null;
  preferred_time: string;
  source: RequestSource;
  utm: Utm | string | null;
  status: RequestStatus;
  notes: string | null;
};

function toRequest(r: Row): CallRequest {
  return {
    id: r.id,
    ref: r.ref,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
    name: r.name,
    business: r.business,
    contact: r.contact,
    contactKind: r.contact_kind,
    kit: r.kit ?? [],
    preferredTime: r.preferred_time,
    source: r.source,
    utm: typeof r.utm === "string" ? (JSON.parse(r.utm) as Utm) : r.utm,
    status: r.status,
    notes: r.notes ?? "",
  };
}

/** Escapes % and _ so a search for "50%" is not a wildcard. */
const likeText = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * A Postgres array literal for the kit. Safe to build by hand: block ids are checked against BLOCK_IDS
 * (plain lower-case words) before they get here. Both Neon and PGlite read it the same way.
 */
const textArray = (ids: readonly string[]) => `{${ids.join(",")}}`;

/** Postgres's "unique_violation". */
const isUniqueViolation = (err: unknown) => typeof err === "object" && err !== null && (err as { code?: unknown }).code === "23505";

export function sqlStore(query: Query): CallRequestStore {
  const run = async (text: string, params: unknown[] = []) => (await query(text, params)) as Row[];

  return {
    kind: "postgres",

    async create(input) {
      // A clash on the 6-character ref is very unlikely; try a fresh one a few times.
      for (let attempt = 0; ; attempt++) {
        try {
          const [row] = await run(
            `INSERT INTO call_requests (id, ref, name, business, contact, contact_kind, kit, preferred_time, source, utm)
             VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9, $10::jsonb)
             RETURNING ${COLUMNS}`,
            [
              newRequestId(),
              newRef(),
              input.name,
              input.business,
              input.contact,
              input.contactKind,
              textArray(input.kit),
              input.preferredTime,
              input.source,
              input.utm ? JSON.stringify(input.utm) : null,
            ],
          );
          return toRequest(row);
        } catch (err) {
          if (!isUniqueViolation(err) || attempt >= 4) throw err;
        }
      }
    },

    async list(filter: ListFilter = {}) {
      const where: string[] = [];
      const params: unknown[] = [];
      if (filter.status) {
        params.push(filter.status);
        where.push(`status = $${params.length}`);
      }
      if (filter.business) {
        params.push(filter.business);
        where.push(`business = $${params.length}`);
      }
      const q = filter.q?.trim();
      if (q) {
        params.push(`%${likeText(q)}%`);
        where.push(`(name ILIKE $${params.length} OR contact ILIKE $${params.length})`);
      }
      params.push(LIST_LIMIT);
      const rows = await run(
        `SELECT ${COLUMNS} FROM call_requests ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
         ORDER BY created_at DESC, id DESC LIMIT $${params.length}`,
        params,
      );
      return rows.map(toRequest);
    },

    async update(id: string, patch: RequestPatch) {
      const [row] = await run(
        `UPDATE call_requests
         SET status = COALESCE($2, status), notes = COALESCE($3, notes), updated_at = now()
         WHERE id = $1
         RETURNING ${COLUMNS}`,
        [id, patch.status ?? null, patch.notes ?? null],
      );
      return row ? toRequest(row) : null;
    },

    async counts({ weekStart, monthStart }: PeriodStarts) {
      const [totals] = (await query(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE status = 'new')::int AS new,
                count(*) FILTER (WHERE created_at >= $1::timestamptz)::int AS week,
                count(*) FILTER (WHERE created_at >= $2::timestamptz)::int AS month,
                count(*) FILTER (WHERE status = 'won')::int AS won
         FROM call_requests`,
        [weekStart.toISOString(), monthStart.toISOString()],
      )) as { total: number; new: number; week: number; month: number; won: number }[];
      const groups = (await query(`SELECT business, count(*)::int AS n FROM call_requests GROUP BY business`, [])) as {
        business: BusinessId;
        n: number;
      }[];
      const byBusiness: RequestCounts["byBusiness"] = {};
      for (const g of groups) byBusiness[g.business] = Number(g.n);
      return {
        total: Number(totals.total),
        new: Number(totals.new),
        week: Number(totals.week),
        month: Number(totals.month),
        won: Number(totals.won),
        byBusiness,
      };
    },
  };
}
