import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, sessionCookieOptions } from "@/lib/admin/auth";
import { adminGate, adminJson } from "@/lib/admin/http";

/** Clears the session cookie. Still 503 when admin is not set up, but the cookie is cleared either way. */
export async function POST(req: NextRequest) {
  const blocked = adminGate(req, { requireSession: false });
  const res = blocked ?? adminJson({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
