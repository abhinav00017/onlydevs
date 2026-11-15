"use client";
import dynamic from "next/dynamic";
import { CalmSceneFallback, ChaosHeroFallback, FixSceneFallback, KitBlocksFallback, Ogi3DFallback } from "./fallbacks";
import type { CalmSceneProps, ChaosHeroProps, FixSceneProps, KitBlocksProps, Ogi3DProps } from "./types";

/** The only import path for pages. Each scene loads in the browser after the page; its fallback shows until then. */
export const ChaosHero = dynamic<ChaosHeroProps>(() => import("./ChaosHero"), { ssr: false, loading: () => <ChaosHeroFallback /> });
export const FixScene = dynamic<FixSceneProps>(() => import("./FixScene"), { ssr: false, loading: () => <FixSceneFallback step={0} /> });
export const CalmScene = dynamic<CalmSceneProps>(() => import("./CalmScene"), { ssr: false, loading: () => <CalmSceneFallback /> });
export const Ogi3D = dynamic<Ogi3DProps>(() => import("./Ogi3D"), { ssr: false, loading: () => <Ogi3DFallback /> });
export const KitBlocks = dynamic<KitBlocksProps>(() => import("./KitBlocks"), { ssr: false, loading: () => <KitBlocksFallback blocks={[]} /> });
export { Ogi3DFallback } from "./fallbacks";
export type { Accessory, FixStep } from "./types";
