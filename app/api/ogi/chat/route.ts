import { NextResponse, type NextRequest } from "next/server";
import { PRODUCTS } from "@/lib/content";
import { runOgi } from "@/lib/ogi/engine";
import { getOgiModel } from "@/lib/ogi/model";
import { profileForPage } from "@/lib/ogi/profiles";
import { clientIp, rateLimit } from "@/lib/ogi/rateLimit";
import { chatRequestSchema } from "@/lib/ogi/request";
import type { Role } from "@/lib/ogi/tools";

/** Chat messages per IP per minute. In memory per server instance (lib/ogi/rateLimit.ts), so looser across Vercel instances. */
const CHAT_LIMIT = 20;
/** Awake checks per IP per minute. The panel asks once per page load, on first open. */
const STATUS_LIMIT = 30;

/** Lock 1: the role is decided here, on the server. There is no owner mode, so it is always "visitor". */
const ROLE: Role = "visitor";

const COPY = PRODUCTS.ogi.chat;

/** JSON that no browser or CDN caches. */
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Is Ogi awake for this page? The panel asks once when it first opens. GET /api/ogi/chat?page=onlydevs
 * Reading the request first keeps this handler dynamic under Cache Components, so the key is read per request.
 */
export async function GET(req: NextRequest) {
  const profile = profileForPage(req.nextUrl.searchParams.get("page") ?? "");
  if (!profile) return json({ ok: false, error: "Unknown page." }, 400);
  if (!rateLimit(`ogi-status:${clientIp(req.headers)}`, { limit: STATUS_LIMIT })) return json({ ok: false, error: COPY.tooMany }, 429);
  const awake = getOgiModel() !== null;
  return json({ ok: true, awake, greeting: profile.greeting, email: profile.contact.email });
}

/** One chat turn: `{ page, messages }` in, `{ reply, book? }` out. */
export async function POST(req: NextRequest) {
  if (!rateLimit(`ogi:${clientIp(req.headers)}`, { limit: CHAT_LIMIT })) return json({ ok: false, error: COPY.tooMany }, 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: COPY.unreadable }, 400);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: COPY.unreadable }, 400);

  const profile = profileForPage(parsed.data.page);
  if (!profile) return json({ ok: false, error: "Unknown page." }, 400);

  const model = getOgiModel();
  if (!model) return json({ ok: false, resting: true, error: COPY.restingLine, email: profile.contact.email }, 503);

  const result = await runOgi({ profile, role: ROLE, messages: parsed.data.messages, model });
  return json({ ok: true, ...result });
}
