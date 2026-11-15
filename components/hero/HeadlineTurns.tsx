"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/visuals/useCalm";
import { TURN_FOR_VERTICAL, verticalAt } from "./cycle";
import { useHeroPin } from "./HeroPin";

/** How long each turn of the headline stays, in ms. */
export const TURN_MS = 3200;

const EASE = [0.22, 1, 0.36, 1] as const;

type Turn = { from: string; to: string };

/**
 * Line two of the hero headline: "Missed calls → answered.", then the next turn, word by word.
 * The server renders the first turn. Every turn sits in the same grid cell (hidden ones invisible),
 * so the line keeps the height of the longest turn and nothing below it moves.
 * Screen readers get all four turns once, as plain text. "Reduce motion": the first turn, still.
 * In the pinned hero the scroll picks the turn, the one that goes with the business on the device.
 */
export function HeadlineTurns({ turns, className }: { turns: readonly Turn[]; className?: string }) {
  const reduce = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  const pin = useHeroPin();
  const pinned = pin?.pinned ?? false;

  useEffect(() => {
    if (reduce || pinned) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % turns.length), TURN_MS);
    return () => window.clearInterval(id);
  }, [reduce, pinned, turns.length]);

  const active = reduce ? 0 : pinned && pin ? TURN_FOR_VERTICAL[verticalAt(pin.step)] % turns.length : index;
  const turn = turns[active];

  return (
    <span className={className}>
      <span className="sr-only">{turns.map((t) => `${t.from}, ${t.to}`).join(" ")}</span>
      <span aria-hidden className="grid" data-turn={active}>
        {turns.map((t) => (
          <span key={t.from} className="invisible col-start-1 row-start-1">
            <TurnText turn={t} />
          </span>
        ))}
        <AnimatePresence initial={false}>
          <motion.span key={turn.from} className="col-start-1 row-start-1" data-active-turn>
            <TurnText turn={turn} animated />
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

function TurnText({ turn, animated = false }: { turn: Turn; animated?: boolean }) {
  const words = [
    ...turn.from.split(" ").map((w) => ({ w, tone: "from" as const })),
    { w: "→", tone: "arrow" as const },
    ...turn.to.split(" ").map((w) => ({ w, tone: "to" as const })),
  ];
  return (
    <>
      {words.map(({ w, tone }, i) => {
        const cls = tone === "from" ? "text-ink/35" : "text-brand";
        const space = i < words.length - 1 ? " " : null;
        if (!animated) {
          return (
            <Fragment key={i}>
              <span className={`inline-block ${cls}`}>{w}</span>
              {space}
            </Fragment>
          );
        }
        return (
          <Fragment key={i}>
            <motion.span
              className={`inline-block ${cls}`}
              initial={{ opacity: 0, y: "0.45em", filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, delay: 0.18 + i * 0.06, ease: EASE } }}
              exit={{ opacity: 0, y: "-0.35em", filter: "blur(6px)", transition: { duration: 0.4, delay: i * 0.03, ease: EASE } }}
            >
              {w}
            </motion.span>
            {space}
          </Fragment>
        );
      })}
    </>
  );
}
