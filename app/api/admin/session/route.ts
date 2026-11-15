import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin/auth";
import { adminGate, adminJson } from "@/lib/admin/http";

/** What /admin shows: "not set up" (503), the login form, or the dashboard. Reads the cookie, so it runs per request. */
export async function GET(req: NextRequest) {
  const blocked = adminGate(req, { requireSession: false });
  if (blocked) return blocked;
  return adminJson({ ok: true, configured: true, authed: isAdmin(req.cookies.get(ADMIN_COOKIE)?.value) });
}
