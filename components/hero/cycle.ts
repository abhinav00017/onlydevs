"use client";

import { useEffect, useReducer } from "react";
import { HERO_SCREENS, type HeroFeedItem, type HeroScreen } from "@/components/visuals/sample";
import { getVertical } from "@/lib/site";

/**
 * The hero device's live screen: which business is on screen, and what has just arrived.
 * Plain state and a reducer, so the order and the timing are easy to test without a browser.
 */

/** The four businesses the screen walks through, in this order (decisions.md, 15 Nov 2026). */
export const HERO_ORDER = ["cafe", "clinic", "crm", "events"] as const;
export type HeroVerticalId = (typeof HERO_ORDER)[number];

/** A new item arrives every 2.6 seconds. */
export const ARRIVE_MS = 2600;
/** After three arrivals, the screen moves on to the next business. */
export const ARRIVALS_PER_VERTICAL = 3;
/** Rows kept on the phone list. */
export const MAX_ROWS = 4;

export type CycleState = {
  /** Index into HERO_ORDER. */
  index: number;
  /** Items arrived so far for this business. */
  arrivals: number;
  /** Newest first. */
  items: readonly HeroFeedItem[];
  /** The live count on the screen (orders today, tickets sold, ...). */
  count: number;
  /** The id of the item that arrived last, so the screen can mark it. */
  latest: string | null;
};

/**
 * `tick`: the next item arrives. With `advance` (the default), after ARRIVALS_PER_VERTICAL items the screen moves on to
 * the next business; without it (the pinned hero, where scroll picks the business), the screen rests once its items are in.
 * `goto`: show this business, fresh. `shift`: move by this many businesses.
 */
export type CycleAction = { type: "tick"; advance?: boolean } | { type: "goto"; index: number } | { type: "shift"; by: number };

export function screenFor(index: number): HeroScreen {
  return HERO_SCREENS[HERO_ORDER[wrap(index)]];
}

export function verticalAt(index: number): HeroVerticalId {
  return HERO_ORDER[wrap(index)];
}

/** The label under the device: the site's own name for the vertical (lib/site.ts). */
export function verticalLabel(index: number): string {
  return getVertical(verticalAt(index)).name;
}

function wrap(index: number): number {
  const n = HERO_ORDER.length;
  return ((index % n) + n) % n;
}

export function initialCycle(index = 0): CycleState {
  const i = wrap(index);
  const screen = screenFor(i);
  const seeded = [...screen.seed].reverse();
  return { index: i, arrivals: 0, items: seeded, count: screen.count.start, latest: null };
}

export function cycleReducer(state: CycleState, action: CycleAction): CycleState {
  if (action.type === "shift") return action.by === 0 ? state : initialCycle(state.index + action.by);
  if (action.type === "goto") return wrap(action.index) === state.index ? state : initialCycle(action.index);
  const advance = action.advance ?? true;
  if (advance && state.arrivals >= ARRIVALS_PER_VERTICAL) return initialCycle(state.index + 1);
  const screen = screenFor(state.index);
  // Pinned hero: once this business's new items have all arrived, the screen rests until the scroll moves on.
  if (!advance && state.arrivals >= screen.incoming.length) return state;
  const next = screen.incoming[state.arrivals % screen.incoming.length];
  return {
    index: state.index,
    arrivals: state.arrivals + 1,
    items: [next, ...state.items].slice(0, MAX_ROWS),
    count: state.count + (next.add ?? 1),
    latest: next.id,
  };
}

/**
 * Runs the cycle: a tick every ARRIVE_MS while `running`. Stopped, the screen holds still
 * (reduce motion shows the first business, as it is at the start). `advance`: whether ticks move on to the next business.
 */
export function useHeroCycle(running: boolean, advance = true) {
  const [state, dispatch] = useReducer(cycleReducer, 0, initialCycle);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => dispatch({ type: "tick", advance }), ARRIVE_MS);
    return () => window.clearInterval(id);
  }, [running, advance]);
  return [state, dispatch] as const;
}

/* ---------- The pinned hero (desktops and tablets): scroll picks the business ---------- */

/** The pinned hero section is this tall; the stage stays on screen (sticky) for all but the last screen of it. */
export const PIN_HEIGHT_SVH = 360;

/**
 * Which business the pinned scroll shows. Each business is centred on its own pose (progress 0, 0.25, 0.5, 0.75;
 * components/hero/choreography.ts) and the screen switches half-way between two, mid camera move. Events stays on
 * through the final pull-back.
 */
export function stepFromProgress(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(HERO_ORDER.length - 1, Math.floor(p * HERO_ORDER.length + 0.5));
}

/**
 * The headline turn that goes with each business while pinned, so the words and the screen agree
 * (indexes into HERO.turns: paper orders, forgotten visits, lost leads, missed calls).
 */
export const TURN_FOR_VERTICAL: Record<HeroVerticalId, number> = { cafe: 0, clinic: 1, crm: 2, events: 3 };
