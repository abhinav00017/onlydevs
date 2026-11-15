"use client";

import { Canvas, invalidate, useFrame, type RootState } from "@react-three/fiber";
import { Component, createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

/**
 * The hero's one canvas. Adapted from the unmerged 3D branch (components/three/core/SceneCanvas.tsx).
 * The hero decides beforehand that this device can run it (components/hero/env.ts), so this wrapper only:
 * - draws while the hero is on screen, and stops (frameloop "never") when it leaves;
 * - caps the pixel ratio at 1.5;
 * - tracks the pointer for a subtle tilt;
 * - calls `onFail` on context loss or a render error (the hero then shows the flat device for good);
 * - calls `onReady` after the first real frame.
 * It sits in its own stacking context, because drei's Html occlusion uses very large z-indexes.
 */

/** Live facts the scene reads inside useFrame (never during render). */
export type SceneLive = {
  /** Cursor relative to the window: -1 to 1 across it. +y is up. */
  pointer: { x: number; y: number };
};

const LiveContext = createContext<RefObject<SceneLive> | null>(null);
const PortalContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useSceneLive(): RefObject<SceneLive> {
  const live = useContext(LiveContext);
  if (!live) throw new Error("useSceneLive must be used inside SceneCanvas");
  return live;
}

/**
 * Where drei's Html puts the live UI: a fixed element beside the canvas. Without it, Html's target changes
 * once the canvas connects its events, and Html re-creates its React root on the same element (a race that can blank a screen).
 */
export function useScreenPortal(): RefObject<HTMLElement> {
  const portal = useContext(PortalContext);
  if (!portal) throw new Error("useScreenPortal must be used inside SceneCanvas");
  return portal as RefObject<HTMLElement>;
}

/** Keeps a long frame gap (after a pause) from making motion jump. */
export function clampDelta(delta: number) {
  return Math.min(delta, 1 / 20);
}

type Props = {
  className?: string;
  camera: { position: [number, number, number]; fov: number };
  onReady: () => void;
  onFail: () => void;
  children: ReactNode;
};

export function SceneCanvas({ className, camera, onReady, onFail, children }: Props) {
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const portal = useRef<HTMLDivElement>(null);
  const live = useRef<SceneLive>({ pointer: { x: 0, y: 0 } });
  const fail = useRef(onFail);
  const ready = useRef(onReady);
  useEffect(() => {
    fail.current = onFail;
    ready.current = onReady;
  });
  const handlers = useMemo(
    () => ({
      fail: () => {
        setFailed(true);
        fail.current();
      },
      ready: () => ready.current(),
    }),
    [],
  );

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) setVisible(entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      live.current.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      live.current.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      live.current.pointer.x = 0;
      live.current.pointer.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    if (visible) invalidate();
  }, [visible]);

  if (failed) return null;

  const onCreated = (state: RootState) => {
    state.gl.toneMapping = ACESFilmicToneMapping;
    state.gl.toneMappingExposure = 1.05;
    state.gl.outputColorSpace = SRGBColorSpace;
    state.gl.domElement.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        handlers.fail();
      },
      { once: true },
    );
  };

  return (
    <div ref={host} className={className} style={{ isolation: "isolate" }} aria-hidden data-hero-canvas>
      <CanvasBoundary onError={handlers.fail}>
        <Canvas
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          dpr={[1, 1.5]}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
          camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 80 }}
          onCreated={onCreated}
        >
          <LiveContext.Provider value={live}>
            <PortalContext.Provider value={portal}>
              {children}
              <FirstFrame onFrame={handlers.ready} />
            </PortalContext.Provider>
          </LiveContext.Provider>
        </Canvas>
      </CanvasBoundary>
      <div ref={portal} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
    </div>
  );
}

function FirstFrame({ onFrame }: { onFrame: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    // A few frames: the first compiles shaders, the live UI needs a frame to lay out behind the glass.
    if (frames.current === 4) onFrame();
  });
  return null;
}

class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
