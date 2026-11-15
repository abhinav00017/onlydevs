import { NextResponse } from "next/server";

/** JSON that no browser or CDN caches. */
export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export type ReadResult = { ok: true; body: unknown } | { ok: false; reason: "too_large" | "unreadable" };

/**
 * Reads a JSON body, but never more than `maxBytes`. Checks Content-Length first, then counts the bytes
 * as they arrive, so a missing or false Content-Length cannot get a bigger body in.
 */
export async function readJsonCapped(req: Request, maxBytes: number): Promise<ReadResult> {
  const declared = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, reason: "too_large" };
  if (!req.body) return { ok: false, reason: "unreadable" };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return { ok: false, reason: "too_large" };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.byteLength;
  }
  try {
    return { ok: true, body: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { ok: false, reason: "unreadable" };
  }
}
