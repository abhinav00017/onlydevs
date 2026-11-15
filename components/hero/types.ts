import type { MotionValue } from "motion/react";
import type { CycleState } from "./cycle";

/** The 3D hero scene's props (components/hero3d/DeviceScene.tsx). Kept here so the hero never imports the 3D code statically. */
export type DeviceSceneProps = {
  /** The live screen: business on screen and the latest items. */
  state: CycleState;
  /** Hero scroll progress, 0 at the top, 1 when the hero has scrolled away. The device turns with it. */
  progress: MotionValue<number>;
  /** Called after the first real frame, so the flat device can fade out. */
  onReady: () => void;
  /** Called on context loss or a render error: the hero falls back to the flat device for good. */
  onFail: () => void;
  className?: string;
};
