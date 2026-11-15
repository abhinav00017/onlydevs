"use client";

import { AnimatePresence, motion, useMotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BLEED_X, cx } from "@/components/site/ui";
import { usePrefersReducedMotion } from "@/components/visuals/useCalm";
import { HERO } from "@/lib/content";
import { HERO_ORDER, useHeroCycle, verticalLabel, type HeroVerticalId } from "./cycle";
import { useHeroPin } from "./HeroPin";
import { PHONE_QUERY, canRun3D, probeWebGL } from "./env";
import { FlatDevice } from "./FlatDevice";
import { HeroPoster } from "./HeroPoster";

/**
 * The 3D scene: three.js, React Three Fiber and drei. Fetched only here, only in the browser (ssr: false),
 * only on a capable desktop or tablet, and only after the page has loaded and the browser is idle.
 */
const DeviceScene = dynamic(() => import("@/components/hero3d/DeviceScene"), { ssr: false });

/** How long the hero waits for the 3D (visible time) before giving up and keeping the poster. */
const GIVE_UP_MS = 8000;

/** `?hero-poster`: the poster script's capture mode (scripts/hero-poster.mjs): the live screen holds still. */
const noop = () => () => {};
const readCapture = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("hero-poster");

function subscribePhone(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const readPhone = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(PHONE_QUERY).matches : true);

/**
 * The hero's stage.
 * - Desktops and tablets (motion allowed): the poster, a still of our own 3D scene at step 0, lined up with the canvas,
 *   from the first paint (CSS only). On a capable device the live 3D loads after the page, fades in over the poster
 *   once it has drawn, and the poster then steps away. No shape change. If the 3D cannot run here (low power), fails,
 *   or has not drawn after 8 s, the poster stays.
 * - Phones, "reduce motion" and browsers without WebGL: the flat CSS device running the same live screen.
 */
export function HeroStage({ className }: { className?: string }) {
  const reduce = usePrefersReducedMotion();
  const phone = useSyncExternalStore(subscribePhone, readPhone, () => true);
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const pin = useHeroPin();
  const pinned = pin?.pinned ?? false;
  // Pinned: the scroll picks the business and items keep arriving on it. Not pinned (phones): the screen cycles on its own.
  const capture = useSyncExternalStore(noop, readCapture, () => false);
  const [state, dispatch] = useHeroCycle(!reduce && onScreen && !capture, !pinned);
  const idle = useMotionValue(0);
  const progress = pin?.progress ?? idle;
  /**
   * null until the browser has checked this device; then what it gets: "3d" (the live scene over the poster),
   * "poster" (WebGL works but the device is too slow for the live scene), or "flat" (no WebGL).
   */
  const [decided, setDecided] = useState<"flat" | "poster" | "3d" | null>(null);
  const [want3D, setWant3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const flat = reduce || phone || decided === "flat";
  const show3D = want3D && !flat && !failed;
  const live3D = show3D && ready;

  // The pinned scroll's step is the business on screen, from the first paint and after a reload mid-pin.
  const step = pin?.step ?? 0;
  useEffect(() => {
    if (pinned) dispatch({ type: "goto", index: step });
  }, [pinned, step, dispatch]);

  // Pause the live screen while the hero is off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => setOnScreen(e.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Decide once, in the browser. Deferred a tick (not a frame: background tabs pause frames), so it never runs
  // inside the commit that triggered the effect.
  useEffect(() => {
    const id = setTimeout(() => {
      if (reduce || phone) setDecided("flat");
      // The poster script runs headless (software WebGL): it always wants the live scene.
      else if (canRun3D() || (capture && probeWebGL() !== "none")) setDecided("3d");
      else setDecided(probeWebGL() === "none" ? "flat" : "poster");
    }, 0);
    return () => clearTimeout(id);
  }, [reduce, phone, capture]);

  // Fetch the 3D only after load, when the browser is idle.
  useEffect(() => {
    if (decided !== "3d" || flat) return;
    let cancelled = false;
    let idleId: number | undefined;
    let timer: number | undefined;
    const go = () => {
      if (!cancelled) setWant3D(true);
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
  }, [decided, flat]);

  // If the 3D has not drawn after 8 s of the page being visible (a background tab draws nothing), stop waiting:
  // the poster stays.
  const waiting = decided === "3d" && !flat && !failed && !ready;
  useEffect(() => {
    if (!waiting) return;
    let visibleFor = 0;
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === "visible") visibleFor += now - last;
      last = now;
      if (visibleFor >= GIVE_UP_MS) setFailed(true);
    }, 250);
    return () => clearInterval(id);
  }, [waiting]);

  return (
    <div
      ref={ref}
      className={cx("sm:[container-type:size]", className)}
      data-hero-stage={show3D ? "3d" : flat ? "flat" : decided === null ? "pending" : "poster"}
    >
      {pinned ? <StepBackdrop index={state.index} /> : null}
      {/* The poster: on wider screens with motion allowed (CSS), until the live 3D has drawn over it; never with the flat device. */}
      <HeroPoster className={cx(flat && decided !== null && "hidden!", "transition-opacity duration-700", live3D && "opacity-0 delay-1000")} />
      <div
        aria-hidden
        data-flat-wrapper
        className={cx(
          // The flat device is for phones, "reduce motion" and no WebGL. Before the check, CSS shows it only on
          // phones and for "reduce motion"; wider screens show the poster instead.
          decided === null && "sm:motion-safe:hidden",
          decided !== null && !flat && "hidden",
          "mx-auto w-[min(74vw,300px)]",
          "sm:absolute sm:bottom-[-14%] sm:left-1/2 sm:w-[min(44vw,340px)] sm:-translate-x-1/2",
          "lg:top-1/2 lg:right-[18vw] lg:bottom-auto lg:left-auto lg:w-[min(21vw,33svh)] lg:translate-x-0 lg:-translate-y-[52%]",
        )}
      >
        <FlatDevice state={state} tilt={!reduce} />
      </div>
      {show3D ? (
        <DeviceScene
          state={state}
          progress={progress}
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

/** A soft glow behind the devices, one shade of the brand purple per business. */
const GLOWS: Record<HeroVerticalId, string> = {
  cafe: "rgb(111 50 214 / 0.16)",
  clinic: "rgb(139 92 246 / 0.2)",
  crm: "rgb(90 36 184 / 0.15)",
  events: "rgb(168 85 247 / 0.2)",
};

/**
 * Behind the devices in the pinned hero: a very large, soft word for the business on screen (brand ink, low opacity,
 * edge to edge), and a soft colour glow that shifts per business. Both change with the step; the words above stay
 * readable over the wash in front of them.
 */
function StepBackdrop({ index }: { index: number }) {
  const id = HERO_ORDER[index];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" data-step-word={HERO.words[id]}>
      {HERO_ORDER.map((v) => (
        <div
          key={v}
          className={cx("absolute inset-0 transition-opacity duration-1000 ease-in-out", v === id ? "opacity-100" : "opacity-0")}
          style={{ background: `radial-gradient(42% 52% at 70% 52%, ${GLOWS[v]} 0%, transparent 100%)` }}
        />
      ))}
      <AnimatePresence initial={false}>
        <motion.span
          key={id}
          className="absolute inset-x-0 top-[calc(50%-0.42em)] block text-center text-[min(24vw,44svh)] leading-none font-extrabold tracking-[-0.05em] whitespace-nowrap text-ink/[0.07] uppercase"
          initial={{ y: "18%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-18%", opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        >
          {HERO.words[id]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** The small label: which business is on screen, with one mark per business. */
function VerticalLabel({ index }: { index: number }) {
  return (
    <div className={cx("pointer-events-none relative z-10 order-first flex justify-center pb-5 sm:absolute sm:order-none sm:inset-x-0 sm:bottom-[5.25rem] sm:py-0 lg:justify-end", BLEED_X)}>
      {/* lg:mr keeps the label clear of Ogi's chat button, which sits bottom-right above the bottom bar. */}
      <p className="inline-flex items-center gap-3 rounded-full bg-card/85 px-4 py-2 text-sm font-semibold text-ink shadow-float-sm ring-1 ring-line backdrop-blur-md lg:mr-[4.5rem]" data-vertical-label>
        <span className="whitespace-nowrap text-muted">{HERO.showing}</span>
        <span className="whitespace-nowrap sm:min-w-[10.5rem]">{verticalLabel(index)}</span>
        <span aria-hidden className="flex gap-1">
          {HERO_ORDER.map((id, i) => (
            <span key={id} className={cx("h-1.5 rounded-full transition-all duration-500", i === index ? "w-5 bg-brand" : "w-1.5 bg-ink/20")} />
          ))}
        </span>
      </p>
    </div>
  );
}
