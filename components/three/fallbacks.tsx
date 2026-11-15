import type { Accessory, CalmSceneProps, ChaosHeroProps, FixSceneProps, KitBlocksProps, Ogi3DProps } from "./types";

/** Static stand-ins. They render on the server, before 3D loads, and for "reduce motion". Keep them light. */
const SVG_ACCESSORIES: Partial<Record<Accessory, string>> = {
  clinic: "/brand/ogi-clinic.svg",
  cafe: "/brand/ogi-cafe.svg",
  realestate: "/brand/ogi-realestate.svg",
  owner: "/brand/ogi-owner.svg",
};

export function Ogi3DFallback({ accessory = "none", size = 160, className }: Ogi3DProps) {
  const src = SVG_ACCESSORIES[accessory] ?? "/brand/ogi.svg";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" aria-hidden width={size} height={Math.round(size * 1.03)} className={className} />;
}

export function ChaosHeroFallback({ className }: ChaosHeroProps) {
  return <div aria-hidden className={className} />;
}

export function FixSceneFallback({ accessory = "none", className }: FixSceneProps) {
  return (
    <div aria-hidden className={className}>
      <Ogi3DFallback accessory={accessory} size={140} />
    </div>
  );
}

export function CalmSceneFallback({ className }: CalmSceneProps) {
  return (
    <div aria-hidden className={className}>
      <Ogi3DFallback size={180} />
    </div>
  );
}

export function KitBlocksFallback({ blocks, className }: KitBlocksProps) {
  return <div aria-hidden className={className} data-blocks={blocks.join(",")} />;
}
