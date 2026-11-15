"use client";

import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/components/site/ui";
import { kitBlockSpec } from "./kit";
import type { KitBlocksProps } from "./types";
import { SCALE } from "./ui";
import { usePrefersReducedMotion } from "./useCalm";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The kit, as flat cards that slide and settle into a neat grid when blocks are added or removed.
 * One card per id; duplicates show once; unknown ids get a neutral card. "Reduce motion": no movement.
 */
export default function KitBlocks({ blocks, business, className }: KitBlocksProps) {
  const reduce = usePrefersReducedMotion();
  const ids = [...new Set(blocks.map(String))];
  const specs = ids.map((id) => kitBlockSpec(id, business));
  const cols = specs.length <= 4 ? 2 : 3;

  return (
    <div className={cx("@container relative", className)}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: "radial-gradient(rgb(20 39 47 / 0.07) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      />
      <div style={SCALE} className="absolute inset-0 flex items-center justify-center p-[1.4em]">
        {specs.length === 0 ? (
          <div aria-hidden className="grid w-full max-w-[24em] grid-cols-2 gap-[0.8em]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[6.4em] rounded-[1em] border-[0.12em] border-dashed border-ink/15" />
            ))}
          </div>
        ) : (
          <ul data-testid="kit-blocks" className={cx("grid w-full gap-[0.8em]", cols === 2 ? "max-w-[24em] grid-cols-2" : "grid-cols-3")}>
            <AnimatePresence initial={false} mode="popLayout">
              {specs.map((spec) => {
                const Icon = spec.icon;
                return (
                  <motion.li
                    key={spec.id}
                    data-block={spec.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: 14, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className={cx(
                      "flex min-h-[6.4em] flex-col justify-between gap-[0.7em] rounded-[1em] bg-white p-[0.9em] shadow-float-sm ring-1",
                      spec.known ? "ring-ink/[0.07]" : "ring-ink/10",
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span
                        className={cx(
                          "flex size-[2.2em] items-center justify-center rounded-[0.65em]",
                          spec.known ? "bg-brand-soft text-brand" : "bg-ink/[0.05] text-ink/50",
                        )}
                      >
                        <Icon aria-hidden className="size-[1.15em]" strokeWidth={2.2} />
                      </span>
                      <span aria-hidden className="flex gap-[0.2em]">
                        <span className="h-[0.35em] w-[1.6em] rounded-full bg-ink/10" />
                        <span className={cx("h-[0.35em] w-[0.6em] rounded-full", spec.known ? "bg-brand/40" : "bg-ink/10")} />
                      </span>
                    </span>
                    <span className="text-[1.05em] leading-tight font-semibold text-ink">{spec.label}</span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
