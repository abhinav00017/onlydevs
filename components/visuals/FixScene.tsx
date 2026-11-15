import type { ReactNode } from "react";
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
      </div>
      <div aria-hidden style={SCALE} className={cx("absolute bottom-0 flex", mirrored ? "left-0" : "right-0")}>
        <Reveal from={{ x: mirrored ? -24 : 24, y: 24 }}>
          <Screen />
        </Reveal>
      </div>
    </div>
  );
}
