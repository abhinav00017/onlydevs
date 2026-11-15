"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cx } from "@/components/site/ui";
import { usePrefersReducedMotion } from "@/components/visuals/useCalm";
import { HERO } from "@/lib/content";
import { HERO_ORDER, useHeroCycle, verticalLabel } from "./cycle";
import { PHONE_QUERY, canRun3D } from "./env";
import { FlatDevice } from "./FlatDevice";

/**
 * The 3D scene: three.js, React Three Fiber and drei. Fetched only here, only in the browser (ssr: false),
 * only on a capable desktop or tablet, and only after the page has loaded and the browser is idle.
 */
const DeviceScene = dynamic(() => import("@/components/hero3d/DeviceScene"), { ssr: false });

/** Where the hero's scroll progress turns the screen to the next business. */
const SCROLL_STEPS = [0.12, 0.3, 0.48];

function subscribePhone(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const readPhone = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(PHONE_QUERY).matches : true);

/**
 * The hero's stage. The server renders the flat device (a CSS phone running the live screen), so there is
 * never an empty box. On a capable desktop or tablet the 3D scene loads after the first paint and fades in
 * over it once its first frame is drawn. Phones, low-power devices, "reduce motion" and no WebGL keep the flat device.
 */
export function HeroStage({ className }: { className?: string }) {
  const reduce = usePrefersReducedMotion();
  const phone = useSyncExternalStore(subscribePhone, readPhone, () => true);
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [state, dispatch] = useHeroCycle(!reduce && onScreen);
  const [want3D, setWant3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const show3D = want3D && !reduce && !phone && !failed;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const step = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    const next = SCROLL_STEPS.filter((s) => v >= s).length;
    if (next !== step.current) {
      dispatch({ type: "shift", by: next - step.current });
      step.current = next;
    }
  });

  // Pause the live screen while the hero is off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => setOnScreen(e.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Ask for the 3D only after load, when the browser is idle, and only if this device can run it well.
  useEffect(() => {
    if (reduce || phone) return;
    let cancelled = false;
    let idleId: number | undefined;
    let timer: number | undefined;
    const go = () => {
      if (!cancelled && canRun3D()) setWant3D(true);
    };
    const schedule = () => {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(go, { timeout: 2500 });
      else timer = setTimeout(go, 800) as unknown as number;
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [reduce, phone]);

  const live3D = show3D && ready;

  return (
    <div ref={ref} className={className} data-hero-stage={show3D ? "3d" : "flat"}>
      <div
        aria-hidden
        className={cx(
          "transition-opacity duration-700",
          "mx-auto w-[min(74vw,300px)]",
          "sm:absolute sm:bottom-[-14%] sm:left-1/2 sm:w-[min(36vw,280px)] sm:-translate-x-1/2",
          "lg:top-1/2 lg:right-[13%] lg:bottom-auto lg:left-auto lg:w-[clamp(240px,19vw,320px)] lg:translate-x-0 lg:-translate-y-[46%]",
          live3D && "pointer-events-none opacity-0",
        )}
      >
        <FlatDevice state={state} tilt={!reduce} />
      </div>
      {show3D ? (
        <DeviceScene
          state={state}
          progress={scrollYProgress}
          onReady={() => setReady(true)}
          onFail={() => {
            setFailed(true);
            setReady(false);
          }}
          className={cx("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}
        />
      ) : null}
      <VerticalLabel index={state.index} />
    </div>
  );
}

/** The small label: which business is on screen, with one mark per business. */
function VerticalLabel({ index }: { index: number }) {
  return (
    <div className="pointer-events-none relative z-10 order-first flex justify-center pb-5 sm:absolute sm:order-none sm:inset-x-0 sm:bottom-[5.5rem] sm:py-0 lg:justify-end lg:pr-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
      <p className="inline-flex items-center gap-3 rounded-full bg-card/85 px-4 py-2 text-sm font-semibold text-ink shadow-float-sm ring-1 ring-line backdrop-blur-md" data-vertical-label>
        <span className="text-muted">{HERO.showing}</span>
        <span className="min-w-[10.5rem]">{verticalLabel(index)}</span>
        <span aria-hidden className="flex gap-1">
          {HERO_ORDER.map((id, i) => (
            <span key={id} className={cx("h-1.5 rounded-full transition-all duration-500", i === index ? "w-5 bg-brand" : "w-1.5 bg-ink/20")} />
          ))}
        </span>
      </p>
    </div>
  );
}
