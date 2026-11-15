/**
 * The hero poster: a still of our own 3D scene at step 0 (Cafe), shown at once on desktops and tablets while the
 * live 3D loads, then covered by it. Written by `npm run hero:poster` (scripts/hero-poster.mjs); do not edit by hand.
 *
 * Each image was captured at a reference stage size. `ppu` is the scene's pixels per world unit there
 * (choreography.ts, pixelsPerUnit), `crop` is the captured rectangle in CSS pixels, and `focus` is where the camera's
 * focus point sat, in those same pixels. HeroPoster scales and places the image from these, so it lines up with the
 * live scene on any stage size.
 */
export type PosterShot = {
  src: string;
  width: number;
  height: number;
  ref: { width: number; height: number };
  ppu: number;
  crop: { x: number; y: number; width: number; height: number };
  focus: { x: number; y: number };
  bytes: number;
};

export const POSTER: { wide: PosterShot; tall: PosterShot } = {
  wide: {
    src: "/hero/poster-wide.webp",
    width: 998,
    height: 792,
    ref: {
      width: 1440,
      height: 900
    },
    ppu: 193.9591836734694,
    crop: {
      x: 533,
      y: 144,
      width: 907,
      height: 720
    },
    focus: {
      x: 1094.4,
      y: 477
    },
    bytes: 58908
  },
  tall: {
    src: "/hero/poster-tall.webp",
    width: 820,
    height: 637,
    ref: {
      width: 820,
      height: 1180
    },
    ppu: 150.6122448979592,
    crop: {
      x: 0,
      y: 519,
      width: 820,
      height: 637
    },
    focus: {
      x: 410,
      y: 861.4
    },
    bytes: 44356
  }
};
