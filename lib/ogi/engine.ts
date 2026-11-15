import { generateText, isStepCount, type LanguageModel, type ModelMessage } from "ai";
import { logOgi } from "./log";
import { toPlainText } from "./plainText";
import { safeHandOver, type OgiProfile } from "./profiles";
import { checkReply } from "./replyCheck";
import { buildTools, type BookCard, type Role, type ToolContext } from "./tools";

/**
 * One chat turn, ported from the demo hub (od-demo-1/lib/ogi/engine.ts). The flow, every message:
 *   1. The route maps `page` to a profile through the allow-list and fixes the role ("visitor").         Lock 1
 *   2. The tools are built from the role's allow-list, closed over the server's context.                 Locks 2, 3
 *   3. The model answers, calling tools if it needs to, within the time limit.                           Lock 4
 *   4. The reply becomes plain text, then the reply check runs. A blocked reply becomes the hand-over.   Lock 5
 * The prompt below only sets tone and scope. It is not a lock: every rule that can be checked is checked in code.
 * The demo hub's emergency check is a clinic rule, so it is not here.
 */

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type OgiReply = {
  reply: string;
  /** The "Book a free call" button, when book_call prepared one this turn. */
  book?: BookCard;
  /** Set when the reply is the fixed blocked or error message. */
  kind: "answer" | "blocked" | "error";
};

export function buildInstructions(profile: OgiProfile) {
  return [
    `You are Ogi, the AI assistant on the ${profile.businessName} company website. You speak for ${profile.businessName} only.`,
    "Keep replies short: one to three plain sentences. Be warm, calm and plain-spoken.",
    "Write plain text only. No markdown: no asterisks, no bold, no headings, no bullet symbols.",
    "Answer only from the facts below or from your tools (site_info returns the same facts by topic).",
    "When you point to a page, give its path as it is in the facts, such as /pricing or /services/crm.",
    "Rules:",
    ...profile.rules.map((r) => `- ${r}`),
    "Facts about onlydevs (JSON):",
    JSON.stringify(profile.facts),
  ].join("\n");
}

/** The longest Ogi waits for the model. A slower answer becomes the polite hand-over instead of a hanging chat. */
export const MODEL_TIMEOUT_MS = 20_000;

export async function runOgi({
  profile,
  role,
  messages,
  model,
  timeoutMs = MODEL_TIMEOUT_MS,
}: {
  profile: OgiProfile;
  role: Role;
  messages: ChatMessage[];
  model: LanguageModel;
  timeoutMs?: number;
}): Promise<OgiReply> {
  const ctx: ToolContext = { profile, role, pending: {}, results: [] };
  const tools = buildTools(ctx);

  let text: string;
  try {
    const result = await generateText({
      model,
      instructions: buildInstructions(profile),
      messages: messages.map((m): ModelMessage => ({ role: m.role, content: m.content })),
      tools,
      stopWhen: isStepCount(4),
      maxOutputTokens: 500,
      temperature: 0.3,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(timeoutMs),
    });
    text = toPlainText(result.text);
    // A tool the model asked for that is not in its set never runs; log it so attacks show up.
    for (const step of result.steps) {
      for (const part of step.content) {
        if (part.type === "tool-error") logOgi({ event: "denied_tool", page: profile.key, role, tool: part.toolName.slice(0, 40), outcome: "error" });
      }
    }
  } catch (err) {
    logOgi({ event: "model_error", page: profile.key, role, outcome: err instanceof Error ? err.name : "unknown" });
    return { reply: safeHandOver(profile), kind: "error" };
  }

  if (!text) text = ctx.pending.book ? "Here is a button to book your free call. It opens the form with your kit filled in." : safeHandOver(profile);

  const check = checkReply(text, { profile });
  if (!check.ok) {
    logOgi({ event: "reply_blocked", page: profile.key, role, outcome: check.reasons.join(",") });
    // The button is built by the server from lib/kit.ts, so it is still safe to show with the hand-over.
    return { reply: safeHandOver(profile), kind: "blocked", ...(ctx.pending.book ? { book: ctx.pending.book } : {}) };
  }
  return { reply: text, kind: "answer", ...(ctx.pending.book ? { book: ctx.pending.book } : {}) };
}
