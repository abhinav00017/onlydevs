"use client";

import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/site/ui";

/**
 * Slides a floating screen in, once, when it enters the view.
 * "Reduce motion": CSS (`motion-reduce:`, with !important) beats the inline start state,
 * so the screen is simply there, from the first paint, even before the page hydrates.
 */
export function Reveal({
  children,
  className,
  style,
  from = { x: 0, y: 28 },
  delay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  from?: { x: number; y: number };
  delay?: number;
}) {
  return (
    <motion.div
      className={cx("motion-reduce:transform-none! motion-reduce:opacity-100!", className)}
      style={style}
      initial={{ opacity: 0, x: from.x, y: from.y, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
