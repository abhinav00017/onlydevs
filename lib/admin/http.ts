import type { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { ADMIN_COOKIE, adminPassword, isAdmin } from "./auth";

/** Admin responses: never cached, never indexed. */
export const ADMIN_HEADERS = { "X-Robots-Tag": "noindex, nofollow" };

export const adminJson = (body: unknown, status = 200) => json(body, status, ADMIN_HEADERS);

export const NOT_SET_UP = { ok: false, configured: false, error: "Admin is not set up yet." };
export const NOT_LOGGED_IN = { ok: false, error: "Please log in." };

/**
 * The gate every admin API runs first. A response to return straight away, or null to carry on.
 * 503 when ADMIN_PASSWORD is missing, 401 without a valid session cookie.
 */
export function adminGate(req: NextRequest, { requireSession = true } = {}) {
  if (!adminPassword()) return adminJson(NOT_SET_UP, 503);
  if (requireSession && !isAdmin(req.cookies.get(ADMIN_COOKIE)?.value)) return adminJson(NOT_LOGGED_IN, 401);
  return null;
}

/** Mutations must be JSON. A cross-site form cannot send that without a preflight, on top of SameSite=Strict. */
export function isJson(req: NextRequest) {
  return (req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json");
}
