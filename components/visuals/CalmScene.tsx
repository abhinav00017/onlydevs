import { PHOTOS } from "@/lib/photos";
import { cx } from "@/components/site/ui";
import { PhotoFill } from "./Photo";
import { Reveal } from "./Reveal";
import { DashboardScreen, PhoneScreen } from "./screens";
import type { CalmSceneProps } from "./types";
import { SCALE } from "./ui";

/** The stress-free frame: a calm, clean room, the owner's phone all caught up, and the week on one card. */
export default function CalmScene({ className }: CalmSceneProps) {
  return (
    <div className={cx("@container relative", className)}>
      <div className="absolute top-0 right-0 bottom-[8%] left-[14%] overflow-hidden rounded-[1.75rem] shadow-float sm:rounded-[2.25rem]">
        <PhotoFill photo={PHOTOS.calm} sizes="(min-width: 640px) 400px, calc(86vw - 28px)" />
      </div>
      <div aria-hidden style={SCALE} className="absolute inset-0">
        <Reveal className="absolute bottom-0 left-0" from={{ x: -20, y: 28 }}>
          <PhoneScreen />
        </Reveal>
        <Reveal className="absolute top-[9%] right-[4%]" from={{ x: 20, y: 20 }} delay={0.3}>
          <DashboardScreen compact />
        </Reveal>
      </div>
    </div>
  );
}
