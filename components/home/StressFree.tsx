"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { CalmScene } from "@/components/visuals";
import { CALM } from "@/lib/content";

const CANVAS = "#F2F7F8";
const SOFT_PURPLE = "#EDE4FB";

/**
 * Frame 5: the clutter is gone. The background shifts gently from the light canvas to a soft purple,
 * then fades back to the canvas at the bottom. "Reduce motion" gets the soft purple, still.
 */
export function StressFree() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const backgroundColor = useTransform(scrollYProgress, [0, 1], [CANVAS, SOFT_PURPLE]);

  return (
    <motion.section
      ref={ref}
      aria-labelledby="calm-title"
      style={{ backgroundColor }}
      className="relative overflow-hidden motion-reduce:bg-[#EDE4FB]!"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-20 pb-36 sm:px-6 sm:pt-28 lg:grid-cols-2">
        <div>
          <h2 id="calm-title" className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            {CALM.title}
          </h2>
          <p className="mt-6 max-w-md text-lg text-muted sm:text-xl">{CALM.line}</p>
        </div>
        <CalmScene className="mx-auto aspect-square w-full max-w-md" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-canvas" />
    </motion.section>
  );
}
