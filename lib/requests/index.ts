import { neon } from "@neondatabase/serverless";
import { memoryStore } from "./memory";
import { sqlStore } from "./postgres";
import type { CallRequestStore } from "./types";

export * from "./types";

/** No database on Vercel. The request is refused, so the form shows "Email us instead" and no lead is lost. */
export class StoreUnavailableError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "StoreUnavailableError";
  }
}

let cached: { url: string; store: CallRequestStore } | undefined;

type Env = Record<string, string | undefined>;

/**
 * Postgres (Neon) when DATABASE_URL is set. Without it, the in-memory store, for tests and local development.
 * On Vercel a missing DATABASE_URL is an error rather than memory, because memory would lose the leads.
 * The client is made on first use, never at import or build, and Neon's HTTP driver connects per query.
 */
export function getStore(env: Env = process.env): CallRequestStore {
  const url = env.DATABASE_URL;
  if (!url) {
    if (env.VERCEL === "1") throw new StoreUnavailableError();
    return memoryStore;
  }
  if (cached?.url !== url) {
    const sql = neon(url);
    cached = { url, store: sqlStore(async (text, params) => (await sql.query(text, params)) as Record<string, unknown>[]) };
  }
  return cached.store;
}
