import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, LOGIN_LIMIT, LOGIN_WINDOW_MS, adminPassword, checkPassword, sessionCookieOptions, signSession } from "@/lib/admin/auth";
import { adminGate, adminJson, isJson } from "@/lib/admin/http";
import { readJsonCapped } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/ogi/rateLimit";
import { logRequest } from "@/lib/requests/log";

/** Checks the password against ADMIN_PASSWORD and sets the signed session cookie. */
export async function POST(req: NextRequest) {
  const blocked = adminGate(req, { requireSession: false });
  if (blocked) return blocked;

  if (!rateLimit(`admin-login:${clientIp(req.headers)}`, { limit: LOGIN_LIMIT, windowMs: LOGIN_WINDOW_MS })) {
    logRequest({ event: "admin_login", outcome: "rate_limited" });
    return adminJson({ ok: false, error: "Too many tries. Please wait 15 minutes and try again." }, 429);
  }
  if (!isJson(req)) return adminJson({ ok: false, error: "Send JSON." }, 415);

  const read = await readJsonCapped(req, 2048);
  const given = read.ok && read.body && typeof read.body === "object" ? (read.body as { password?: unknown }).password : undefined;
  const password = adminPassword()!;
  if (!checkPassword(given, password)) {
    logRequest({ event: "admin_login", outcome: "wrong_password" });
    return adminJson({ ok: false, error: "Wrong password." }, 401);
  }

  logRequest({ event: "admin_login", outcome: "ok" });
  const res = adminJson({ ok: true });
  res.cookies.set(ADMIN_COOKIE, signSession(password), sessionCookieOptions());
  return res;
}
