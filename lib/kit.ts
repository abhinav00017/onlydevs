import { z } from "zod";
import type { VerticalId } from "./site";

/**
 * The kit builder's data and its query-param format.
 * /book?business=cafe&kit=website,orders,ogi opens the call form with that kit filled in.
 * Block ids match what <KitBlocks> (components/visuals) shows.
 */
export const BLOCK_IDS = ["website", "orders", "ticketing", "crm", "ogi", "reminders", "dashboard"] as const;
export type BlockId = (typeof BLOCK_IDS)[number];

export type BusinessId = VerticalId | "other";

/** Every vertical in lib/site.ts, plus "other". tests/kit.test.ts checks the two lists match. */
export const businessSchema = z.enum(["clinic", "cafe", "realestate", "events", "crm", "other"]);
export const BUSINESS_IDS = businessSchema.options;
export const blockSchema = z.enum(BLOCK_IDS);

/** A kit as it travels in the URL. Unknown blocks are dropped, duplicates removed, order fixed. */
export const kitSchema = z.object({
  business: businessSchema.optional(),
  blocks: z.array(z.string()).transform((ids) => sortBlocks(ids.filter((id): id is BlockId => blockSchema.safeParse(id).success))),
});
export type Kit = { business?: BusinessId; blocks: BlockId[] };

export function sortBlocks(ids: readonly BlockId[]): BlockId[] {
  const set = new Set(ids);
  return BLOCK_IDS.filter((id) => set.has(id));
}

/** Turns a kit into query params for /book. Empty parts are left out. */
export function kitToSearchParams(kit: Kit): URLSearchParams {
  const params = new URLSearchParams();
  if (kit.business) params.set("business", kit.business);
  const blocks = sortBlocks(kit.blocks);
  if (blocks.length) params.set("kit", blocks.join(","));
  return params;
}

export function kitHref(kit: Kit): string {
  const query = kitToSearchParams(kit).toString();
  return query ? `/book?${query}` : "/book";
}

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(source: ParamSource, key: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  const value = source[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Reads a kit back from query params. Anything invalid is ignored rather than thrown. */
export function kitFromSearchParams(source: ParamSource): Kit {
  const rawBusiness = readParam(source, "business");
  const rawKit = readParam(source, "kit") ?? "";
  const business = businessSchema.safeParse(rawBusiness);
  const parsed = kitSchema.parse({
    blocks: rawKit
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20),
  });
  return { business: business.success ? business.data : undefined, blocks: parsed.blocks };
}

/** Blocks we suggest first for each kind of business (storyboard section 4). */
export const SUGGESTED_BLOCKS: Record<BusinessId, BlockId[]> = {
  clinic: ["website", "orders", "reminders", "ogi", "dashboard"],
  cafe: ["website", "orders", "ogi", "reminders", "dashboard"],
  realestate: ["website", "crm", "orders", "reminders", "dashboard"],
  events: ["website", "ticketing", "reminders", "dashboard"],
  crm: ["crm", "reminders", "dashboard", "website"],
  other: ["website", "ogi", "dashboard"],
};
