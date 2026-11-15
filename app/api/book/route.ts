import type { NextRequest } from "next/server";
import type { FieldErrors } from "@/lib/book";
import { json, readJsonCapped } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/ogi/rateLimit";
import { getStore } from "@/lib/requests";
import { BOOK_BODY_MAX, BOOK_LIMIT, BOOK_WINDOW_MS, bookRequestSchema, toNewRequest } from "@/lib/requests/input";
import { errorKind, logRequest } from "@/lib/requests/log";

const FORM_FIELDS = new Set(["name", "business", "contact", "kit", "time"]);

/**
 * Saves one "Book a free call" request and returns its short reference.
 * 400 with `errors` for a field the visitor can fix; 400 without them for anything else (extra fields, the honeypot).
 * The form shows "Email us instead" for every failure that is not a field error, so a lead is never lost.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(`book:${clientIp(req.headers)}`, { limit: BOOK_LIMIT, windowMs: BOOK_WINDOW_MS })) {
    logRequest({ event: "book", outcome: "rate_limited" });
    return json({ ok: false, error: "too_many" }, 429);
  }

  const read = await readJsonCapped(req, BOOK_BODY_MAX);
  if (!read.ok) {
    logRequest({ event: "book", outcome: read.reason });
    return json({ ok: false, error: read.reason }, read.reason === "too_large" ? 413 : 400);
  }

  const parsed = bookRequestSchema.safeParse(read.body);
  if (!parsed.success) {
    const errors: FieldErrors = {};
    let other = false;
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (issue.code !== "unrecognized_keys" && typeof key === "string" && FORM_FIELDS.has(key)) {
        errors[key as keyof FieldErrors] ??= issue.message;
      } else other = true;
    }
    logRequest({ event: "book", outcome: "invalid" });
    return json(other ? { ok: false, error: "invalid" } : { ok: false, error: "invalid", errors }, 400);
  }

  if (parsed.data.company_url) {
    logRequest({ event: "book", outcome: "honeypot" });
    return json({ ok: false, error: "invalid" }, 400);
  }

  try {
    const saved = await getStore().create(toNewRequest(parsed.data));
    logRequest({ event: "book", outcome: "saved", ref: saved.ref });
    return json({ ok: true, ref: saved.ref }, 201);
  } catch (err) {
    logRequest({ event: "book", outcome: `save_failed:${errorKind(err)}` });
    return json({ ok: false, error: "unavailable" }, 503);
  }
}
