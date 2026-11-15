"use client";

import { CalendarX2, MessageCircle, PhoneMissed } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { PHOTOS } from "@/lib/photos";
import { cx } from "@/components/site/ui";
import { PhotoFill } from "./Photo";
import { CHAOS } from "./sample";
import type { HeroSceneProps } from "./types";
import { Avatar, Pill, SCALE, UiCard, initialsOf } from "./ui";
import { usePrefersReducedMotion } from "./useCalm";

/**
 * The hero: a busy counter, with the everyday chaos floating over it at different depths.
 * Pointer and scroll move the pieces a little (nearer pieces move more). As `progress` rises,
 * they straighten, drift into line and fade, leaving the calm photo. "Reduce motion": all still.
 */
export default function HeroScene({ progress = 0, className }: HeroSceneProps) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const target = useMotionValue(progress);
  useEffect(() => {
    target.set(reduce ? 0 : progress);
  }, [progress, reduce, target]);
  const p = useSpring(target, { stiffness: 160, damping: 30, mass: 0.5 });

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const px = useSpring(pointerX, { stiffness: 70, damping: 18 });
  const py = useSpring(pointerY, { stiffness: 70, damping: 18 });

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    pointerX.set((e.clientX - box.left) / box.width - 0.5);
    pointerY.set((e.clientY - box.top) / box.height - 0.5);
  }
  function onPointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  const photoScale = useTransform(p, [0, 0.6], [1.06, 1]);
  const shade = useTransform(p, [0, 0.5], [0.18, 0]);
  const motionOn = !reduce;

  return (
    <div ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className={cx("@container relative", className)}>
      {/* The photo, inset so the pieces can overlap its edges. */}
      <div className="absolute inset-[5%] overflow-hidden rounded-[1.75rem] shadow-float sm:rounded-[2.25rem]">
        <motion.div className="absolute inset-0" style={motionOn ? { scale: photoScale } : undefined}>
          <PhotoFill photo={PHOTOS.hero} preload sizes="(min-width: 640px) 576px, calc(100vw - 32px)" />
        </motion.div>
        <motion.div aria-hidden className="absolute inset-0 bg-ink" style={{ opacity: motionOn ? shade : 0.12 }} />
      </div>

      {/* The chaos. Decorative: the words beside the hero say the same thing. */}
      <div aria-hidden style={SCALE} className="pointer-events-none absolute inset-0 select-none">
        <Floater p={p} px={px} py={py} on={motionOn} depth={1} rotate={-5} drift={[2, 3]} bob={0} style={{ left: "0%", top: "9%" }}>
          <MissedCall />
        </Floater>
        <Floater p={p} px={px} py={py} on={motionOn} depth={0.55} rotate={7} drift={[-3, 4]} bob={1} style={{ right: "3%", top: "1%" }}>
          <OrderSlip />
        </Floater>
        <Floater p={p} px={px} py={py} on={motionOn} depth={0.75} rotate={-2.5} drift={[3, -1]} bob={2} style={{ left: "13%", top: "41%" }}>
          <CalendarClash />
        </Floater>
        <Floater p={p} px={px} py={py} on={motionOn} depth={1.25} rotate={3.5} drift={[-2, -2]} bob={3} style={{ right: "0%", top: "37%" }}>
          <Messages />
        </Floater>
        <Floater p={p} px={px} py={py} on={motionOn} depth={0.9} rotate={-9} drift={[4, -4]} bob={4} style={{ left: "1%", bottom: "4%" }}>
          <Sticky tone="lilac">{CHAOS.stickies[0].text}</Sticky>
        </Floater>
        <Floater p={p} px={px} py={py} on={motionOn} depth={0.65} rotate={6} drift={[-3, -5]} bob={5} style={{ right: "18%", bottom: "2%" }}>
          <Sticky tone="paper">{CHAOS.stickies[1].text}</Sticky>
        </Floater>
      </div>
    </div>
  );
}

/**
 * One floating piece. `depth` scales how far it moves with the pointer and the scroll.
 * `drift` (in em) is where it slides as it calms. `bob` staggers the slow idle float.
 */
function Floater({
  p,
  px,
  py,
  on,
  depth,
  rotate,
  drift,
  bob,
  style,
  children,
}: {
  p: MotionValue<number>;
  px: MotionValue<number>;
  py: MotionValue<number>;
  on: boolean;
  depth: number;
  rotate: number;
  drift: [number, number];
  bob: number;
  style: CSSProperties;
  children: ReactNode;
}) {
  const x = useTransform([p, px], ([pv, pxv]: number[]) => `calc(${pv * drift[0]}em + ${pxv * depth * 18}px)`);
  const y = useTransform([p, py], ([pv, pyv]: number[]) => `calc(${pv * drift[1]}em + ${pyv * depth * 14 - pv * depth * 36}px)`);
  const r = useTransform(p, [0, 0.4], [rotate, 0]);
  const s = useTransform(p, [0, 0.55], [1, 0.94]);
  const o = useTransform(p, [0.25, 0.55], [1, 0]);

  return (
    <motion.div
      className="absolute"
      style={{ ...style, zIndex: Math.round(depth * 10), ...(on ? { x, y, rotate: r, scale: s, opacity: o } : { rotate }) }}
    >
      <div className={on ? "animate-[float_7s_ease-in-out_infinite] motion-reduce:animate-none" : undefined} style={on ? { animationDelay: `${-bob * 1.3}s` } : undefined}>
        {children}
      </div>
    </motion.div>
  );
}

function MissedCall() {
  const c = CHAOS.missedCall;
  return (
    <UiCard className="flex w-[17em] items-start gap-[0.7em] p-[0.8em]">
      <span className="flex size-[2.5em] shrink-0 items-center justify-center rounded-[0.75em] bg-brand text-white">
        <PhoneMissed className="size-[1.25em]" strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-[1em] leading-tight font-semibold">{c.title}</span>
          <span className="text-[0.75em] text-ink/45">{c.when}</span>
        </span>
        <span className="mt-[0.15em] block text-[0.88em] leading-snug text-ink/60">
          {c.from} · {c.count}
        </span>
      </span>
    </UiCard>
  );
}

/** A creased paper slip: torn bottom edge, faint folds, typed lines and a scribble. */
function OrderSlip() {
  const s = CHAOS.slip;
  return (
    <div style={{ filter: "drop-shadow(0 10px 18px rgb(20 39 47 / 0.22)) drop-shadow(0 1px 1px rgb(20 39 47 / 0.12))" }}>
      <div
        className="w-[10.5em] bg-[#fbfaf6] px-[1em] pt-[0.9em] pb-[1.6em] font-mono text-ink/80"
        style={{
          clipPath:
            "polygon(0 0,100% 0,100% 94%,92% 100%,84% 95%,76% 100%,68% 95%,60% 100%,52% 95%,44% 100%,36% 95%,28% 100%,20% 95%,12% 100%,4% 95%,0 99%)",
          backgroundImage:
            "linear-gradient(112deg, transparent 38%, rgb(20 39 47 / 0.06) 39%, transparent 52%), linear-gradient(-14deg, transparent 58%, rgb(255 255 255 / 0.9) 59%, rgb(20 39 47 / 0.05) 61%, transparent 72%), linear-gradient(180deg, rgb(20 39 47 / 0.03), transparent 30%)",
        }}
      >
        <span className="block border-b border-dashed border-ink/25 pb-[0.4em] text-[0.95em] font-bold tracking-wide">{s.title}</span>
        <ul className="mt-[0.5em] space-y-[0.25em] text-[0.8em] leading-snug">
          {s.lines.map((line, i) => (
            <li key={line} className={i === 2 ? "text-ink/45 line-through decoration-ink/40" : undefined}>
              {line}
            </li>
          ))}
        </ul>
        <span className="mt-[0.6em] block -rotate-3 text-[0.8em] font-semibold text-brand-strong italic">{s.note}</span>
      </div>
    </div>
  );
}

function CalendarClash() {
  const c = CHAOS.clash;
  return (
    <UiCard className="w-[16.5em] overflow-hidden">
      <span className="flex items-center justify-between border-b border-ink/[0.07] px-[0.85em] py-[0.6em]">
        <span className="text-[0.95em] font-semibold">{c.day}</span>
        <Pill tone="solid">
          <CalendarX2 className="size-[1.05em]" strokeWidth={2.4} />
          {c.label}
        </Pill>
      </span>
      <span className="flex gap-[0.6em] px-[0.85em] py-[0.75em]">
        <span className="pt-[0.1em] text-[0.75em] font-semibold text-ink/45">{c.events[0].time}</span>
        <span
          className="relative flex flex-1"
          style={{ backgroundImage: "repeating-linear-gradient(135deg, rgb(111 50 214 / 0.07) 0 6px, transparent 6px 12px)" }}
        >
          {c.events.map((e, i) => (
            <span
              key={e.who}
              className={cx(
                "min-w-0 flex-1 rounded-[0.5em] border-l-[0.25em] px-[0.5em] py-[0.4em]",
                i === 0 ? "border-brand bg-brand-soft" : "-ml-[0.9em] translate-y-[0.6em] border-ink/50 bg-white shadow-float-sm ring-1 ring-ink/[0.07]",
              )}
            >
              <span className="block truncate text-[0.8em] font-semibold">{e.what}</span>
              <span className="block truncate text-[0.72em] text-ink/55">{e.who}</span>
            </span>
          ))}
        </span>
      </span>
      <span className="block h-[0.6em]" />
    </UiCard>
  );
}

function Messages() {
  const m = CHAOS.messages;
  return (
    <UiCard className="w-[15.5em] p-[0.8em]">
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-[0.4em] text-[0.9em] font-semibold">
          <MessageCircle className="size-[1.15em] text-brand" strokeWidth={2.2} />
          {m.app}
        </span>
        <span className="flex h-[1.6em] min-w-[1.6em] items-center justify-center rounded-full bg-brand px-[0.45em] text-[0.75em] font-bold text-white">
          {m.unread}
        </span>
      </span>
      <span className="mt-[0.55em] block space-y-[0.45em]">
        {m.items.map((item) => (
          <span key={item.from} className="flex items-center gap-[0.55em]">
            <Avatar initials={initialsOf(item.from)} tone="ink" className="text-[0.75em]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[0.8em] leading-tight font-semibold">{item.from}</span>
              <span className="block truncate text-[0.8em] leading-snug text-ink/60">{item.text}</span>
            </span>
            <span className="size-[0.5em] shrink-0 rounded-full bg-brand" />
          </span>
        ))}
      </span>
    </UiCard>
  );
}

function Sticky({ tone, children }: { tone: "lilac" | "paper"; children: ReactNode }) {
  return (
    <div
      className={cx(
        "relative flex size-[8.5em] items-center p-[0.9em] text-[1em] leading-snug font-semibold text-ink/80 shadow-float-sm",
        tone === "lilac" ? "bg-[#ece2fc]" : "bg-[#fbf6e8]",
      )}
      style={{ backgroundImage: "linear-gradient(160deg, rgb(255 255 255 / 0.5), transparent 45%, rgb(20 39 47 / 0.04))" }}
    >
      <span className="absolute -top-[0.55em] left-1/2 h-[1.1em] w-[3.6em] -translate-x-1/2 -rotate-2 bg-white/70 ring-1 ring-ink/5" />
      <span className="text-[0.85em]">{children}</span>
    </div>
  );
}
