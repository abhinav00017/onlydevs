import { BarChart3, Bell, Blocks, Contact, Globe, MessageCircle, ShoppingBag, Ticket, type LucideIcon } from "lucide-react";

/**
 * What each kit block shows in KitBlocks: a short label and an icon. Pure, so it is easy to test.
 * Ids are the kit builder's (lib/kit.ts). Any other id still gets a tidy, neutral card.
 */
export type KitBlockSpec = { id: string; label: string; icon: LucideIcon; known: boolean };

const KNOWN: Record<string, { label: string; icon: LucideIcon }> = {
  website: { label: "Website", icon: Globe },
  orders: { label: "Orders", icon: ShoppingBag },
  ticketing: { label: "Ticketing", icon: Ticket },
  crm: { label: "CRM", icon: Contact },
  // The assistant is a plain block with a chat bubble. No character, no mascot.
  ogi: { label: "AI assistant", icon: MessageCircle },
  reminders: { label: "Reminders", icon: Bell },
  dashboard: { label: "Dashboard", icon: BarChart3 },
};

/** Some blocks read better for a given business, as in lib/content.ts KIT.blockNames, but short. */
const FOR_BUSINESS: Record<string, Record<string, string>> = {
  clinic: { orders: "Bookings" },
  cafe: { orders: "Orders" },
  realestate: { orders: "Site visits" },
  events: { ticketing: "Tickets" },
};

const MAX_LABEL = 16;

export function kitBlockSpec(rawId: string, business?: string): KitBlockSpec {
  const id = String(rawId ?? "");
  const key = id.trim().toLowerCase();
  const known = KNOWN[key];
  if (known) {
    const label = (business && FOR_BUSINESS[business]?.[key]) || known.label;
    return { id, label, icon: known.icon, known: true };
  }
  const words = id
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let label = words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  if (!label) label = "Extra";
  if (label.length > MAX_LABEL) label = `${label.slice(0, MAX_LABEL - 1).trimEnd()}…`;
  return { id, label, icon: Blocks, known: false };
}
