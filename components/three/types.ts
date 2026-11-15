/**
 * The 3D contract. Pages import only from "@/components/three" and use these props.
 * The 3D scenes live in this folder; each has a static fallback that renders first and whenever 3D is off.
 */
export type Accessory = "none" | "clinic" | "cafe" | "realestate" | "events" | "crm" | "owner";

/** The six "fix" scenes, in storyboard order: 0 website, 1 orders/bookings/tickets, 2 CRM, 3 Ogi, 4 reminders, 5 dashboard. */
export type FixStep = 0 | 1 | 2 | 3 | 4 | 5;

/** `progress` is 0 at the top of the hero and 1 when the pain frame ends. Clutter calms as it rises. */
export type ChaosHeroProps = { progress?: number; className?: string };
export type FixSceneProps = { step: FixStep; accessory?: Accessory; className?: string };
export type CalmSceneProps = { className?: string };
export type Ogi3DProps = { accessory?: Accessory; size?: number; wave?: boolean; className?: string };
/** Block ids come from the kit builder, e.g. "website", "orders", "crm", "ogi", "reminders", "dashboard", "ticketing". */
export type KitBlocksProps = { blocks: readonly string[]; className?: string };
