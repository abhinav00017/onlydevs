"use client";

import { useMotionValue, type MotionValue } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cx } from "@/components/site/ui";
import { usePrefersReducedMotion } from "@/components/visuals/useCalm";
import { stepFromProgress } from "./cycle";

/**
 * The pinned hero. On desktops and tablets (from Tailwind's `sm`, 40rem), with motion allowed, the hero section is
 * PIN_HEIGHT_SVH tall and its stage is sticky: it stays on screen while the visitor scrolls, and the scroll picks
 * the business on the device, one quarter each. Then the pin releases into the next section.
 * Phones and "reduce motion" get a normal, one-screen hero. All of this is CSS first (no layout jump, right on first paint);
 * the script only reads where the visitor is.
 */

export const PIN_QUERY = "(min-width: 40rem)";

type HeroPinInfo = {
  /** True while the hero is a pinned scroll scene. */
  pinned: boolean;
  /** Pinned scroll progress: 0 when the pin starts, 1 when it releases. */
  progress: MotionValue<number>;
  /** The business the pinned scroll shows (index into HERO_ORDER). */
  step: number;
};

const HeroPinContext = createContext<HeroPinInfo | null>(null);

/** The pinned hero's state, or null outside it (tests, other pages). */
export function useHeroPin(): HeroPinInfo | null {
  return useContext(HeroPinContext);
}

function subscribeWide(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(PIN_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const readWide = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(PIN_QUERY).matches : false);

export function HeroPin({ className, stageClassName, children }: { className?: string; stageClassName?: string; children: ReactNode }) {
  const reduce = usePrefersReducedMotion();
  const wide = useSyncExternalStore(subscribeWide, readWide, () => false);
  const pinned = wide && !reduce;
  const ref = useRef<HTMLElement>(null);
  const progress = useMotionValue(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!pinned) {
      progress.set(0);
      return;
    }
    // Read the position from the page itself, so a reload mid-pin (restored scroll, maybe without a scroll event) is right.
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, (window.scrollY - top) / range)) : 0;
      progress.set(p);
      setStep(stepFromProgress(p));
    };
    measure();
    const late = [setTimeout(measure, 50), setTimeout(measure, 300)];
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", measure);
    return () => {
      late.forEach(clearTimeout);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", measure);
    };
  }, [pinned, progress]);

  return (
    <HeroPinContext.Provider value={{ pinned, progress, step: pinned ? step : 0 }}>
      <section ref={ref} aria-labelledby="hero-title" className={className} data-pinned={pinned ? "true" : "false"}>
        <div className={cx(stageClassName)}>{children}</div>
      </section>
    </HeroPinContext.Provider>
  );
}
