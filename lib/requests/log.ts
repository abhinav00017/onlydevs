import { redact } from "@/lib/ogi/log";

/**
 * Log lines for call requests and the admin. Only the event, the outcome and the short reference: never a
 * name, contact, note or IP. `redact` (lib/ogi/log.ts) is a second guard against stray phone numbers.
 */
export type RequestLogEvent = {
  event: "book" | "admin_login" | "admin_update" | "admin_list";
  outcome: string;
  ref?: string;
};

export function logRequest(e: RequestLogEvent) {
  const parts = [e.event, `outcome=${e.outcome}`];
  if (e.ref) parts.push(`ref=${e.ref}`);
  console.info(redact(parts.join(" ")));
}

/** A safe name for an error: its class and Postgres code, never its message (which can quote the row). */
export function errorKind(err: unknown) {
  if (typeof err !== "object" || err === null) return "unknown";
  const name = (err as { name?: unknown }).name;
  const code = (err as { code?: unknown }).code;
  return [typeof name === "string" ? name : "Error", typeof code === "string" ? code : ""].filter(Boolean).join(":").replace(/[^\w:]/g, "");
}
