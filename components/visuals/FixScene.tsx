import type { ReactNode } from "react";
import { PHOTO_CAPTIONS } from "@/lib/content";
import { FIX_PHOTOS, PHOTOS } from "@/lib/photos";
import { cx } from "@/components/site/ui";
import { PhotoFill } from "./Photo";
import { Reveal } from "./Reveal";
import { BookingsScreen, ChatScreen, DashboardScreen, LeadScreen, ReminderScreen, SearchScreen } from "./screens";
import type { FixSceneProps, FixStep } from "./types";
import { SCALE } from "./ui";

const SCREENS: Record<FixStep, () => ReactNode> = {
  0: SearchScreen,
  1: BookingsScreen,
  2: LeadScreen,
  3: ChatScreen,
  4: ReminderScreen,
  5: () => <DashboardScreen />,
};

/**
 * One fix scene: a real photo of the moment, and our product's screen floating over its corner.
 * Even steps put the photo top-left and the screen bottom-right; odd steps mirror it.
 */
export default function FixScene({ step, className }: FixSceneProps) {
  const photo = PHOTOS[FIX_PHOTOS[step]];
  const caption = PHOTO_CAPTIONS[photo.id];
  const Screen = SCREENS[step];
  const mirrored = step % 2 === 1;

  return (
    <div className={cx("@container relative", className)}>
      <div
        className={cx(
          "absolute top-0 bottom-[16%] overflow-hidden rounded-[1.75rem] shadow-float sm:rounded-[2.25rem]",
          mirrored ? "right-0 left-[10%]" : "right-[10%] left-0",
        )}
      >
        <PhotoFill photo={photo} sizes="(min-width: 640px) 460px, calc(90vw - 29px)" />
        {caption ? (
          <>
            <div aria-hidden className="absolute inset-x-0 top-0 h-2/5 bg-linear-to-b from-ink/80 via-ink/30 to-transparent" />
            <p className={cx("absolute top-4 text-sm font-semibold text-white sm:top-5 sm:text-base", mirrored ? "right-5 sm:right-6" : "left-5 sm:left-6")}>
              {caption}
            </p>
          </>
        ) : null}
      </div>
      <div aria-hidden style={SCALE} className={cx("absolute bottom-0 flex", mirrored ? "left-0" : "right-0")}>
        <Reveal from={{ x: mirrored ? -24 : 24, y: 24 }}>
          <Screen />
        </Reveal>
      </div>
    </div>
  );
}
