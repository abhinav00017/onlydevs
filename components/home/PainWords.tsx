"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

/**
 * Frame 3: the pain, lighting up word by word as you scroll.
 * "Reduce motion" shows every word fully lit, through CSS, so server and browser HTML always match.
 */
export function PainWords({ text, id }: { text: string; id?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  return (
    <h2 id={id} ref={ref} className="text-[2.1rem] leading-[1.15] font-bold tracking-tight text-balance sm:text-6xl sm:leading-[1.08]">
      {words.map((word, i) => (
        <Word key={`${word}-${i}`} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </h2>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className="motion-reduce:opacity-100!">
        {children}
      </motion.span>{" "}
    </>
  );
}
