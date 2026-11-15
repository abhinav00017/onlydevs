/**
 * The pinned hero's camera choreography, as plain numbers (no three.js), so it is easy to test.
 * One pose per business, plus a calm wide shot for the release. Within each quarter of the pinned scroll the
 * camera and the devices move to that business's pose over the first 60% (eased in and out, like a product film),
 * then hold. The last quarter holds Events, then pulls back to the wide shot as the pin ends.
 * The 3D scene (components/hero3d/DeviceScene.tsx) damps toward these targets on top, so nothing ever jumps.
 */

export type Vec3 = [number, number, number];

/**
 * How the camera frames the devices for a stage of a given size. Shared by the 3D scene and the static poster
 * (components/hero/HeroPoster.tsx), so the poster lines up with the live scene on any screen.
 */
export const FRAMING = {
  /** Both devices together, in world units (1 = 10 cm). */
  composition: { width: 4.9, height: 2.6 },
  fovDeg: 24,
  /** Wide stages (desktops, landscape tablets): the devices on the right, the words on the left. */
  wide: { minAspect: 1.15, widthShare: 0.66, heightShare: 0.82 },
  /** Tall stages (portrait tablets): the devices centred, low; the words above. */
  tall: { widthShare: 0.9, heightShare: 0.42, shiftY: -0.4 },
} as const;

/** Pixels per world unit at the focus point, for a stage `w` × `h` CSS pixels, at pose distance 1. */
export function pixelsPerUnit(w: number, h: number): number {
  const f = w / Math.max(h, 1) >= FRAMING.wide.minAspect ? FRAMING.wide : FRAMING.tall;
  return Math.min((f.widthShare * w) / FRAMING.composition.width, (f.heightShare * h) / FRAMING.composition.height);
}

export type Pose = {
  /** Camera angle around the focus point, in degrees: 0 is the front, positive swings to the right. */
  azimuth: number;
  /** Camera height angle, in degrees. Lower is more dramatic. */
  elevation: number;
  /** Camera distance, as a share of the distance that frames both devices. Below 1 pushes in. */
  distance: number;
  /** What the camera looks at, as weights: the whole composition, the phone, the laptop's screen. */
  focus: { center: number; phone: number; laptop: number };
  /** Where the focus point sits on screen, -1 to 1 (wide screens; tall screens centre it lower). */
  screenX: number;
  screenY: number;
  phonePosition: Vec3;
  phoneRotation: Vec3;
  laptopPosition: Vec3;
  laptopRotationY: number;
  /** 0 to 1: how far the laptop steps back into shadow (darker, softer) while the phone is the hero. */
  laptopDim: number;
};

const CAFE: Pose = {
  azimuth: 0,
  elevation: 17,
  distance: 1,
  focus: { center: 1, phone: 0, laptop: 0 },
  screenX: 0.52,
  screenY: -0.06,
  phonePosition: [1.62, 0.96, 1.2],
  phoneRotation: [-0.07, 0.12, 0.03],
  laptopPosition: [-0.55, 0, -0.35],
  laptopRotationY: 0.34,
  laptopDim: 0,
};

/** Clinic: the camera swings right, the phone glides forward and fills the frame; the laptop steps back into shadow. */
const CLINIC: Pose = {
  azimuth: 36,
  elevation: 11,
  distance: 0.6,
  focus: { center: 0, phone: 1, laptop: 0 },
  screenX: 0.42,
  screenY: 0.04,
  phonePosition: [1.3, 1.0, 2.0],
  phoneRotation: [-0.04, 0.6, 0.02],
  laptopPosition: [-0.75, 0, -1.25],
  laptopRotationY: 0.5,
  laptopDim: 1,
};

/** Business CRM: the camera swings to the other side, the laptop turns to it and the camera pushes in on its screen. */
const CRM: Pose = {
  azimuth: -30,
  elevation: 14,
  distance: 0.58,
  focus: { center: 0, phone: 0, laptop: 1 },
  screenX: 0.44,
  screenY: 0.02,
  phonePosition: [3.6, 0.96, -1.6],
  phoneRotation: [-0.07, -0.3, 0.03],
  laptopPosition: [-0.2, 0, 0.1],
  laptopRotationY: -0.48,
  laptopDim: 0,
};

/** Events: a lower, more dramatic angle; the phone turns towards the viewer like a ticket held out to be scanned. */
const EVENTS: Pose = {
  azimuth: 14,
  elevation: 3,
  distance: 0.66,
  focus: { center: 0.25, phone: 0.75, laptop: 0 },
  screenX: 0.44,
  screenY: -0.02,
  phonePosition: [0.95, 1.12, 2.1],
  phoneRotation: [0.1, 0.22, -0.16],
  laptopPosition: [-0.7, 0, -0.75],
  laptopRotationY: 0.2,
  laptopDim: 0.35,
};

/** Release: a calm wide shot. */
const WIDE: Pose = { ...CAFE, azimuth: -6, elevation: 22, distance: 1.12 };

/** The poses in order: Cafe, Clinic, Business CRM, Events, then the release. */
export const POSES: readonly Pose[] = [CAFE, CLINIC, CRM, EVENTS, WIDE];

/** Smooth ease in and out (smootherstep): no overshoot, no bounce. */
export function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

export function mixPose(a: Pose, b: Pose, t: number): Pose {
  return {
    azimuth: mix(a.azimuth, b.azimuth, t),
    elevation: mix(a.elevation, b.elevation, t),
    distance: mix(a.distance, b.distance, t),
    focus: {
      center: mix(a.focus.center, b.focus.center, t),
      phone: mix(a.focus.phone, b.focus.phone, t),
      laptop: mix(a.focus.laptop, b.focus.laptop, t),
    },
    screenX: mix(a.screenX, b.screenX, t),
    screenY: mix(a.screenY, b.screenY, t),
    phonePosition: mix3(a.phonePosition, b.phonePosition, t),
    phoneRotation: mix3(a.phoneRotation, b.phoneRotation, t),
    laptopPosition: mix3(a.laptopPosition, b.laptopPosition, t),
    laptopRotationY: mix(a.laptopRotationY, b.laptopRotationY, t),
    laptopDim: mix(a.laptopDim, b.laptopDim, t),
  };
}

/**
 * The poses sit at pinned progress 0, 0.25, 0.5, 0.75 (Cafe, Clinic, CRM, Events) and 1 (the wide release shot).
 * Around each one the camera holds still; between two, it moves over the middle MOVE_SHARE of the gap, eased in and out.
 * The screen switches business half-way through each move (stepFromProgress), so the swipe rides the camera move.
 */
export const MOVE_SHARE = 0.6;

/** The target pose for a pinned scroll progress (0 to 1). */
export function poseAt(progress: number): Pose {
  const s = Math.min(1, Math.max(0, progress)) * 4;
  const k = Math.min(3, Math.floor(s));
  const t = s - k;
  const hold = (1 - MOVE_SHARE) / 2;
  return mixPose(POSES[k], POSES[k + 1], ease((t - hold) / MOVE_SHARE));
}
