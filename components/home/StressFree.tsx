"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { CalmScene } from "@/components/visuals";
import { CALM } from "@/lib/content";

const CANVAS = "#F2F7F8";
const SOFT_PURPLE = "#EDE4FB";

/**
 * Frame 5: the clutter is gone. A full-bleed calm photo with the owner's phone and the week floating over it.
 * The words sit on the left over a soft wash that shifts gently from the light canvas to a soft purple.
 * "Reduce motion" gets the soft purple, still.
 */
export function StressFree() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const backgroundColor = useTransform(scrollYProgress, [0, 1], [CANVAS, SOFT_PURPLE]);
  const wash = useTransform(
    scrollYProgress,
    [0, 1],
    [
      `linear-gradient(to right, ${CANVAS} 22%, ${CANVAS}cc 42%, transparent 68%)`,
      `linear-gradient(to right, ${SOFT_PURPLE} 22%, ${SOFT_PURPLE}cc 42%, transparent 68%)`,
    ],
  );

  return (
    <motion.section
      ref={ref}
      aria-labelledby="calm-title"
      style={{ backgroundColor }}
      className="relative isolate overflow-hidden motion-reduce:bg-[#EDE4FB]! lg:flex lg:min-h-[90svh] lg:items-center"
    >
      <CalmScene className="h-[64svh] min-h-[440px] lg:absolute lg:inset-0 lg:h-auto lg:min-h-0" />
      <motion.div aria-hidden style={{ backgroundImage: wash }} className="pointer-events-none absolute inset-0 hidden lg:block" />
      <div className="relative mx-auto w-full max-w-6xl px-4 pt-12 pb-36 sm:px-6 lg:py-28">
        <div className="max-w-lg">
          <h2 id="calm-title" className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            {CALM.title}
          </h2>
          <p className="mt-6 text-lg text-muted sm:text-xl">{CALM.line}</p>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-canvas" />
    </motion.section>
  );
}
