import type { ReactNode } from "react";
import { PHOTO_CAPTIONS } from "@/lib/content";
import { FIX_PHOTOS, PHOTOS } from "@/lib/photos";
import { cx } from "@/components/site/ui";
import { PhotoFill } from "./Photo";
import { Reveal } from "./Reveal";
import { BookingsScreen, ChatScreen, DashboardScreen, LeadScreen, ReminderScreen, SearchScreen } from "./screens";
import type { FixSceneProps, FixStep } from "./types";

const SCREENS: Record<FixStep, () => ReactNode> = {
  0: SearchScreen,
  1: BookingsScreen,
  2: LeadScreen,
  3: ChatScreen,
  4: ReminderScreen,
  5: () => <DashboardScreen />,
};

/**
 * One fix scene, full-bleed: a real photo of the moment, edge to edge, with our product's screen floating over it.
 * The frame around it puts the words on the other side, over a soft wash (components/home/frames.tsx).
 * Even steps keep the screen on the right; odd steps mirror it to the left.
 */
export default function FixScene({ step, className }: FixSceneProps) {
  const photo = PHOTOS[FIX_PHOTOS[step]];
  const caption = PHOTO_CAPTIONS[photo.id];
  const Screen = SCREENS[step];
  const mirrored = step % 2 === 1;

  return (
    <div className={cx("@container relative overflow-hidden", className)} data-fix-step={step}>
      <PhotoFill photo={photo} sizes="100vw" />
      {caption ? (
        <>
          <div aria-hidden className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-ink/60 via-ink/20 to-transparent" />
          <p
            className={cx(
              "absolute top-5 text-sm font-semibold text-white sm:top-7 sm:text-base",
              mirrored ? "left-5 sm:left-8 lg:left-[6%]" : "right-5 sm:right-8 lg:right-[6%]",
            )}
          >
            {caption}
          </p>
        </>
      ) : null}
      <div
        aria-hidden
        style={{ fontSize: "clamp(8.5px, 2.4cqw, 15px)" }}
        className={cx("absolute bottom-[7%] flex lg:bottom-[12%]", mirrored ? "left-[5%] lg:left-[9%]" : "right-[5%] lg:right-[9%]")}
      >
        <Reveal from={{ x: mirrored ? -24 : 24, y: 24 }}>
          <Screen />
        </Reveal>
      </div>
    </div>
  );
}
