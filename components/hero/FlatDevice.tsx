"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { cx } from "@/components/site/ui";
import type { CycleState } from "./cycle";
import { PhoneUI } from "./LiveScreens";

/**
 * The flat device: a premium CSS phone running the same live screen as the 3D one.
 * Phones, low-power devices, "reduce motion" and browsers without WebGL get this, and nothing else.
 * `tilt`: a light CSS perspective tilt, plus a subtle follow of the mouse on desktop. Off for "reduce motion".
 */
export function FlatDevice({ state, tilt, className }: { state: CycleState; tilt: boolean; className?: string }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20, mass: 0.8 });
  const sy = useSpring(py, { stiffness: 60, damping: 20, mass: 0.8 });
  const rotateY = useTransform(sx, (v) => -11 + v * 6);
  const rotateX = useTransform(sy, (v) => 5 - v * 4);

  useEffect(() => {
    if (!tilt) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [tilt, px, py]);

  return (
    <div className={cx("[perspective:1600px]", className)} data-flat-device data-tilt={tilt ? "on" : "off"}>
      <motion.div className="relative aspect-[72/154] w-full [transform-style:preserve-3d]" style={tilt ? { rotateX, rotateY, rotateZ: 1.5 } : undefined}>
        {/* Soft contact shadow under the phone. */}
        <div aria-hidden className="absolute inset-x-[8%] -bottom-[5%] h-[7%] rounded-[50%] bg-ink/30 blur-xl" />
        {/* Satin metal frame: a brushed gradient, a fine highlight on the edge. */}
        <div
          className="absolute inset-0 rounded-[15%/7%] p-[1.6%]"
          style={{
            background: "linear-gradient(150deg, #a5aab0 0%, #5c6167 22%, #2c2f33 48%, #50555b 70%, #9aa0a6 100%)",
            boxShadow:
              "0 1px 1px rgb(255 255 255 / 0.5) inset, 0 -1px 1px rgb(0 0 0 / 0.35) inset, 0 2px 4px rgb(20 39 47 / 0.14), 0 22px 44px -14px rgb(20 39 47 / 0.42), 0 60px 110px -40px rgb(20 39 47 / 0.5)",
          }}
        >
          {/* Dark glass bezel. */}
          <div className="h-full w-full rounded-[14%/6.5%] bg-[#060708] p-[2.4%] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
            <div className="relative h-full w-full overflow-hidden rounded-[11.5%/5.4%]">
              <PhoneUI state={state} />
              {/* A small punch-hole camera, centred: a generic modern phone, not one brand's notch. */}
              <span aria-hidden className="absolute top-[1.3%] left-1/2 aspect-square w-[3.8%] -translate-x-1/2 rounded-full bg-[#050506] ring-1 ring-white/5" />
              {/* Glass: a faint sheen across the screen. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(118deg, rgb(255 255 255 / 0.16) 0%, rgb(255 255 255 / 0.04) 28%, transparent 42%, transparent 100%)" }}
              />
            </div>
          </div>
        </div>
        {/* Side buttons. */}
        <span aria-hidden className="absolute top-[20%] -right-[1.1%] h-[11%] w-[1.4%] rounded-r-full bg-linear-to-r from-[#3a3e43] to-[#8a9096]" />
        <span aria-hidden className="absolute top-[34%] -right-[1.1%] h-[6%] w-[1.4%] rounded-r-full bg-linear-to-r from-[#3a3e43] to-[#8a9096]" />
      </motion.div>
    </div>
  );
}
