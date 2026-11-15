/**
 * The visuals contract. Pages import only from "@/components/visuals".
 * Real photos with our product screens floating over them, in HTML and CSS. No WebGL.
 */

/** The six "fix" scenes, in storyboard order: 0 website, 1 orders/bookings/tickets, 2 CRM, 3 AI assistant, 4 reminders, 5 dashboard. */
export type FixStep = 0 | 1 | 2 | 3 | 4 | 5;

/** `progress` is 0 at the top of the hero and 1 when the pain frame ends. The chaos calms as it rises. */
export type HeroSceneProps = { progress?: number; className?: string };
export type FixSceneProps = { step: FixStep; className?: string };
export type CalmSceneProps = { className?: string };
/**
 * Block ids come from the kit builder (lib/kit.ts): "website", "orders", "ticketing", "crm", "ogi", "reminders", "dashboard".
 * Unknown ids get a neutral card. `business` only changes block names (e.g. "Appointment booking" for a clinic).
 */
export type KitBlocksProps = { blocks: readonly string[]; business?: string; className?: string };
