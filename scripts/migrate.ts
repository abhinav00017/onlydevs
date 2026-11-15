/**
 * Creates the call_requests table and its indexes from db/schema.sql. Safe to run more than once.
 * Usage: npm run db:migrate   (reads DATABASE_URL from the shell, or from .env.development.local / .env.local)
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { schemaStatements } from "../lib/requests/schema";

// Values already in the shell win over the files.
for (const file of [".env.development.local", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // No such file. Fine.
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Set it in the shell or .env.development.local, then run again.");
  process.exit(1);
}

const sql = neon(url);
const statements = schemaStatements(readFileSync(path.join(process.cwd(), "db/schema.sql"), "utf8"));

async function main() {
  for (const statement of statements) {
    await sql.query(statement);
    console.log(`ok: ${statement.split("\n")[0]}`);
  }
  const [{ count }] = (await sql.query("SELECT count(*)::int AS count FROM call_requests")) as { count: number }[];
  console.log(`call_requests table ready, ${count} rows`);
}

main().catch((err: unknown) => {
  // The message only, never the URL.
  console.error("migrate failed:", err instanceof Error ? err.message : "unknown error");
  process.exit(1);
});
