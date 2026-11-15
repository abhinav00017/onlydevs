import type { NextRequest } from "next/server";
import { adminGate, adminJson, isJson } from "@/lib/admin/http";
import { readJsonCapped } from "@/lib/http";
import { getStore } from "@/lib/requests";
import { REQUEST_ID } from "@/lib/requests/ids";
import { patchRequestSchema } from "@/lib/requests/input";
import { errorKind, logRequest } from "@/lib/requests/log";

/** Changes a request's status, its notes, or both. */
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/requests/[id]">) {
  const blocked = adminGate(req);
  if (blocked) return blocked;

  const { id } = await ctx.params;
  if (!REQUEST_ID.test(id)) return adminJson({ ok: false, error: "No such request." }, 404);
  if (!isJson(req)) return adminJson({ ok: false, error: "Send JSON." }, 415);

  const read = await readJsonCapped(req, 16 * 1024);
  if (!read.ok) return adminJson({ ok: false, error: "That change could not be read." }, read.reason === "too_large" ? 413 : 400);
  const patch = patchRequestSchema.safeParse(read.body);
  if (!patch.success) return adminJson({ ok: false, error: "That change is not valid." }, 400);

  try {
    const updated = await getStore().update(id, patch.data);
    if (!updated) return adminJson({ ok: false, error: "No such request." }, 404);
    logRequest({ event: "admin_update", outcome: "ok", ref: updated.ref });
    return adminJson({ ok: true, request: updated });
  } catch (err) {
    logRequest({ event: "admin_update", outcome: `failed:${errorKind(err)}` });
    return adminJson({ ok: false, error: "Could not save. Try again." }, 503);
  }
}
