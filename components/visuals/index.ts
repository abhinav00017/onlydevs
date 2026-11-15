/**
 * The only import path for pages. Real photos (lib/photos.ts) with our product's screens floating over them,
 * drawn in HTML and CSS. No WebGL. Each scene keeps a fixed box, so nothing shifts while photos load.
 */
export { default as HeroScene } from "./HeroScene";
export { default as FixScene } from "./FixScene";
export { default as CalmScene } from "./CalmScene";
export { default as KitBlocks } from "./KitBlocks";
export type { CalmSceneProps, FixSceneProps, FixStep, HeroSceneProps, KitBlocksProps } from "./types";
