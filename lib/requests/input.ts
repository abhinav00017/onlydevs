import { z } from "zod";
import { bookingSchema, isEmail, type Booking } from "@/lib/book";
import { BUSINESS_IDS, type BusinessId } from "@/lib/kit";
import { SOURCES, STATUSES, UTM_KEYS, statusSchema, type ContactKind, type NewCallRequest, type Utm } from "./types";

/** Longest UTM value we keep. Longer ones are cut, not refused: a long campaign name must not lose a lead. */
export const UTM_MAX = 100;
/** Longest note the admin can save. */
export const NOTES_MAX = 4000;
/** Biggest request body POST /api/book reads. A real request is well under 1 KB. */
export const BOOK_BODY_MAX = 8 * 1024;
/** Call requests per IP per window. A person sends one; a few retries are fine. In memory per server instance. */
export const BOOK_LIMIT = 5;
export const BOOK_WINDOW_MS = 10 * 60_000;

const utmValue = z.string().transform((v) => v.trim().slice(0, UTM_MAX));

/**
 * POST /api/book. The form's own checks (lib/book.ts) plus where the visitor came from, and the honeypot.
 * Strict: any other field is refused.
 */
export const bookRequestSchema = z.strictObject({
  ...bookingSchema.shape,
  source: z.enum(SOURCES).default("form"),
  utm: z.strictObject(Object.fromEntries(UTM_KEYS.map((k) => [k, utmValue.optional()])) as Record<(typeof UTM_KEYS)[number], z.ZodOptional<typeof utmValue>>).optional(),
  /** The honeypot. Hidden from people; a bot that fills it is refused. */
  company_url: z.string().max(200).optional(),
});

export type BookRequest = z.infer<typeof bookRequestSchema>;

export function contactKind(contact: string): ContactKind {
  return isEmail(contact) ? "email" : "phone";
}

/** Drops empty UTM values. Null when none is left. */
export function cleanUtm(utm: Utm | undefined): Utm | null {
  if (!utm) return null;
  const out: Utm = {};
  for (const key of UTM_KEYS) if (utm[key]) out[key] = utm[key];
  return Object.keys(out).length ? out : null;
}

/** The row to save, from a parsed request. */
export function toNewRequest(data: BookRequest): NewCallRequest {
  const booking = data as unknown as Booking;
  return {
    name: booking.name,
    business: booking.business,
    contact: booking.contact,
    contactKind: contactKind(booking.contact),
    kit: booking.kit,
    preferredTime: booking.time,
    source: data.source,
    utm: cleanUtm(data.utm),
  };
}

/** PATCH /api/admin/requests/[id]: a new status, new notes, or both. */
export const patchRequestSchema = z
  .strictObject({
    status: statusSchema.optional(),
    notes: z.string().max(NOTES_MAX).optional(),
  })
  .refine((v) => v.status !== undefined || v.notes !== undefined, "Nothing to change.");

/** GET /api/admin/requests filters, from the query string. Empty values mean "all". */
export const listQuerySchema = z.strictObject({
  status: z.enum(STATUSES).optional(),
  business: z.enum(BUSINESS_IDS as unknown as [BusinessId, ...BusinessId[]]).optional(),
  q: z.string().trim().max(80).optional(),
});
