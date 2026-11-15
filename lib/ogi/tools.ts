import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { CTA, KIT, blockName } from "@/lib/content";
import { BLOCK_IDS, BUSINESS_IDS, SUGGESTED_BLOCKS, kitHref, sortBlocks, type BlockId, type BusinessId } from "@/lib/kit";
import { logOgi } from "./log";
import { INFO_TOPICS, type OgiProfile } from "./profiles";

/**
 * Ogi's tools, and who may use them.
 *
 * Lock 2: a per-role allow-list in code, deny by default. A role that is not listed gets no tools at all.
 * Lock 3: every tool reads the profile from the server closure `ctx`. No input schema has a business id, a page,
 *         a role or anything like it, so nothing the model writes can point a tool at other facts.
 * The visitor's kind of business (`kind`) is only a category from lib/kit.ts, used to pick kit blocks.
 * The model can never create anything on the server: book_call only builds a link to the /book form.
 */
export const TOOL_NAMES = ["site_info", "suggest_kit", "book_call"] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

/** One role. There is no owner mode: owner tools do not exist, so no input can reach them. */
export const ROLES = ["visitor"] as const;
export type Role = (typeof ROLES)[number];

const ROLE_TOOLS: Readonly<Record<Role, readonly ToolName[]>> = Object.freeze({
  visitor: Object.freeze(["site_info", "suggest_kit", "book_call"] as const),
});

/** The tools a role may use on a profile: on the role's list AND switched on for the profile. Unknown role = none. */
export function allowedTools(role: string, profile: OgiProfile): ToolName[] {
  const list: readonly ToolName[] = Object.hasOwn(ROLE_TOOLS, role) ? ROLE_TOOLS[role as Role] : [];
  return list.filter((name) => profile.tools.includes(name));
}

// --- Input schemas. Exported so the attack tests can prove none of them carries a business, page or role field. ---

const KIND_HELP =
  "The visitor's kind of business: clinic, cafe (cafes and restaurants), realestate (real estate), events (events and ticketing), crm (any team that sells), or other.";

export const siteInfoInput = z.strictObject({
  topic: z.enum(INFO_TOPICS).describe("Which part of the onlydevs facts to look up."),
});

export const suggestKitInput = z.strictObject({
  kind: z.enum(BUSINESS_IDS).describe(KIND_HELP),
});

export const bookCallInput = z.strictObject({
  kind: z.enum(BUSINESS_IDS).describe(KIND_HELP),
  blocks: z
    .array(z.enum(BLOCK_IDS))
    .max(BLOCK_IDS.length)
    .optional()
    .describe("The kit blocks the visitor chose, if any. Leave it out when they have not chosen."),
});

export const TOOL_INPUT_SCHEMAS: Readonly<Record<ToolName, z.ZodType>> = {
  site_info: siteInfoInput,
  suggest_kit: suggestKitInput,
  book_call: bookCallInput,
};

/** The "Book a free call" button the panel shows. Built by the server from lib/kit.ts, never by the model. */
export type BookCard = { href: string; label: string; kind: string; blocks: string[] };

/** Server-side context for one chat request. Built from the page allow-list, never from the model. */
export type ToolContext = {
  profile: OgiProfile;
  role: Role;
  /** Filled by book_call. The engine hands it to the browser; the model only hears "button shown". */
  pending: { book?: BookCard };
  /** Text of every tool result this turn, kept for the reply check. */
  results: string[];
};

function record(ctx: ToolContext, name: ToolName, outcome: string, result: unknown) {
  logOgi({ event: "tool", page: ctx.profile.key, role: ctx.role, tool: name, outcome });
  ctx.results.push(JSON.stringify(result));
  return result;
}

const kindLabel = (kind: BusinessId) => KIT.businesses.find((b) => b.id === kind)?.label ?? kind;
const describeBlocks = (blocks: readonly BlockId[], kind: BusinessId) =>
  blocks.map((id) => ({ id, name: blockName(id, kind), line: KIT.blocks[id].line }));

const BUILDERS: Record<ToolName, (ctx: ToolContext) => ToolSet[string]> = {
  site_info: (ctx) =>
    tool({
      description:
        "Look up onlydevs facts: about us, the verticals we build for, the six services, our two products, how it works, pricing, our promises, contact, live demos and common questions. Answer only from what this returns.",
      inputSchema: siteInfoInput,
      execute: async ({ topic }) => record(ctx, "site_info", topic, { topic, facts: ctx.profile.facts[topic] }),
    }),

  suggest_kit: (ctx) =>
    tool({
      description: "Suggest the kit blocks onlydevs recommends first for a kind of business. Use it once you know the visitor's kind of business.",
      inputSchema: suggestKitInput,
      execute: async ({ kind }) =>
        record(ctx, "suggest_kit", kind, {
          kind,
          label: kindLabel(kind),
          blocks: describeBlocks(SUGGESTED_BLOCKS[kind], kind),
          note: "These are suggestions. The visitor can add or remove blocks on the free call.",
        }),
    }),

  book_call: (ctx) =>
    tool({
      description:
        "Show the visitor a Book a free call button that opens the call form with their kind of business and kit filled in. " +
        "This books nothing and sends nothing: the visitor fills in and sends the form themselves.",
      inputSchema: bookCallInput,
      execute: async ({ kind, blocks = [] }) => {
        const kit = sortBlocks(blocks);
        ctx.pending.book = {
          href: kitHref({ business: kind, blocks: kit }),
          label: CTA.book,
          kind: kindLabel(kind),
          blocks: kit.map((id) => blockName(id, kind)),
        };
        // The model hears only that the button is on screen.
        return record(ctx, "book_call", kit.length ? "button_with_kit" : "button", {
          shown: true,
          note: "The visitor now sees a Book a free call button that opens the form with this filled in. Nothing is booked until they send the form.",
          label: ctx.pending.book.kind,
          blocks: ctx.pending.book.blocks,
        });
      },
    }),
};

/** The tool set for one request: only the allowed tools, each closed over the server's context. */
export function buildTools(ctx: ToolContext): ToolSet {
  const tools: ToolSet = {};
  for (const name of allowedTools(ctx.role, ctx.profile)) tools[name] = BUILDERS[name](ctx);
  return tools;
}
