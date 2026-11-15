import type { NextRequest } from "next/server";
import { adminGate, adminJson } from "@/lib/admin/http";
import { getStore } from "@/lib/requests";
import { listQuerySchema } from "@/lib/requests/input";
import { errorKind, logRequest } from "@/lib/requests/log";
import { periodStarts } from "@/lib/requests/time";

/** The admin list (newest first, with filters) and the top counts. GET /api/admin/requests?status=new&business=cafe&q=asha */
export async function GET(req: NextRequest) {
  const blocked = adminGate(req);
  if (blocked) return blocked;

  const raw = Object.fromEntries([...req.nextUrl.searchParams].filter(([, v]) => v !== ""));
  const filter = listQuerySchema.safeParse(raw);
  if (!filter.success) return adminJson({ ok: false, error: "Those filters are not valid." }, 400);

  try {
    const store = getStore();
    const [requests, counts] = await Promise.all([store.list(filter.data), store.counts(periodStarts())]);
    return adminJson({ ok: true, storage: store.kind, requests, counts });
  } catch (err) {
    logRequest({ event: "admin_list", outcome: `failed:${errorKind(err)}` });
    return adminJson({ ok: false, error: "Could not load requests. Try again." }, 503);
  }
}
