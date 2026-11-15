"use client";

/**
 * Should this visitor get the 3D hero? Checked in the browser, after the first paint, before any 3D code loads.
 * Adapted from the unmerged 3D branch (its core/env.ts). It lives here, not in components/hero3d,
 * because it must run before the 3D chunk is fetched: nothing outside components/hero3d may import from it statically.
 */

export type WebGLSupport = "none" | "slow" | "ok";

let glSupport: WebGLSupport | undefined;

function tryContext(failIfMajorPerformanceCaveat: boolean): boolean {
  try {
    const canvas = document.createElement("canvas");
    const options = { failIfMajorPerformanceCaveat };
    const gl = (canvas.getContext("webgl2", options) ?? canvas.getContext("webgl", options)) as WebGLRenderingContext | null;
    if (!gl || typeof gl.getParameter !== "function") return false;
    // Hand the probe context back straight away; browsers allow only a few at once.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Checks once per page whether WebGL works, without three.js. "slow" means software rendering. */
export function probeWebGL(): WebGLSupport {
  if (glSupport) return glSupport;
  if (typeof document === "undefined") return "none";
  glSupport = tryContext(true) ? "ok" : tryContext(false) ? "slow" : "none";
  return glSupport;
}

/** Test hook: forget the cached probe result. */
export function resetWebGLProbe() {
  glSupport = undefined;
}

/** Phones get the flat device: the 3D is for desktops and tablets only. */
export const PHONE_QUERY = "(max-width: 640px)";

/**
 * True only on a capable desktop or tablet: wider than a phone, no "reduce motion", no data saver,
 * more than 4 CPU cores, more than 4 GB of memory (where the browser says), and hardware WebGL.
 */
export function canRun3D(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  if (window.matchMedia(PHONE_QUERY).matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency || 4) <= 4) return false;
  if ((nav.deviceMemory ?? 8) <= 4) return false;
  return probeWebGL() === "ok";
}
