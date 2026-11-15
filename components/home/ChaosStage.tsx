"use client";

import { useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { ChaosHero } from "@/components/three";
import { InView3D } from "./InView3D";

const ProgressContext = createContext<MotionValue<number> | null>(null);

/**
 * Wraps frames 1 to 3 (hero, proof, pain). Scroll progress runs from 0 at the top of the hero
 * to 1 when the pain frame ends, as the ChaosHero contract asks.
 */
export function ChaosStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <ProgressContext.Provider value={scrollYProgress}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </ProgressContext.Provider>
  );
}

/** The hero's 3D slot. Only this small island re-renders on scroll, in steps of 0.01. */
export function ChaosSlot({ className }: { className?: string }) {
  const fromStage = useContext(ProgressContext);
  const idle = useMotionValue(0);
  const progress = fromStage ?? idle;
  const [value, setValue] = useState(0);
  useMotionValueEvent(progress, "change", (v) => {
    const next = Math.min(1, Math.max(0, Math.round(v * 100) / 100));
    setValue((prev) => (prev === next ? prev : next));
  });
  return (
    <InView3D className={className}>
      <ChaosHero progress={value} className="h-full w-full" />
    </InView3D>
  );
}
