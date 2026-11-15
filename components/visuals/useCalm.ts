"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const read = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(QUERY).matches : false);

/**
 * True when the visitor asked for "reduce motion". Hydration-safe: the server and the first client render
 * both say false, then React re-renders with the real value. (motion's own hook reads it during
 * hydration, which makes the server and client HTML disagree.)
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
