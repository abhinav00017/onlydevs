import { PHOTOS } from "@/lib/photos";
import { cx } from "@/components/site/ui";
import { PhotoFill } from "./Photo";
import { Reveal } from "./Reveal";
import { DashboardScreen, PhoneScreen } from "./screens";
import type { CalmSceneProps } from "./types";

/**
 * The stress-free frame, full-bleed: a calm, clean room, edge to edge, with the owner's phone all caught up
 * and the week on one card floating over its right side. The frame puts the words on the left.
 */
export default function CalmScene({ className }: CalmSceneProps) {
  return (
    <div className={cx("@container relative overflow-hidden", className)} data-calm-scene>
      <PhotoFill photo={PHOTOS.calm} sizes="100vw" />
      <div aria-hidden style={{ fontSize: "clamp(8.5px, 2.3cqw, 15px)" }} className="absolute inset-0">
        <Reveal className="absolute bottom-[6%] left-[6%] lg:bottom-[10%] lg:left-auto lg:right-[24%]" from={{ x: -20, y: 28 }}>
          <PhoneScreen />
        </Reveal>
        <Reveal className="absolute top-[8%] right-[5%] lg:top-[14%] lg:right-[7%]" from={{ x: 20, y: 20 }} delay={0.3}>
          <DashboardScreen compact />
        </Reveal>
      </div>
    </div>
  );
}
