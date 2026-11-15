import { z } from "zod";

/** Caps on what one chat request may carry. */
export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_CHARS = 800;
export const MAX_TOTAL_CHARS = 8000;

/**
 * The chat request. Strict: only `page` and `messages`. A body that adds `role`, `business`, `tools` or anything
 * else is refused, so nothing the browser sends can pick the profile's facts, the role or the tools (Lock 1).
 */
export const chatRequestSchema = z
  .strictObject({
    page: z.string().min(1).max(64),
    messages: z
      .array(
        z.strictObject({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
        }),
      )
      .min(1)
      .max(MAX_MESSAGES),
  })
  .refine((b) => b.messages.at(-1)?.role === "user", { message: "The last message must be the visitor's." })
  .refine((b) => b.messages.reduce((n, m) => n + m.content.length, 0) <= MAX_TOTAL_CHARS, { message: "The conversation is too long." });

export type ChatRequest = z.infer<typeof chatRequestSchema>;
