import { z } from "zod";
import { BOOK_PAGE, KIT, blockName } from "./content";
import { BLOCK_IDS, businessSchema, sortBlocks, type BlockId, type BusinessId } from "./kit";
import { SITE } from "./site";

/**
 * The "Book a free call" form. Until an email-sending key exists (decisions.md, 15 Nov 2026),
 * a valid request opens the visitor's email app with a prefilled message to SITE.email.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** True for 7 to 15 digits, allowing spaces, dashes, brackets and a leading +. */
export function isPhone(value: string): boolean {
  const v = value.trim();
  if (!/^\+?[\d\s\-()]+$/.test(v)) return false;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function isEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

const E = BOOK_PAGE.errors;

export const bookingSchema = z.object({
  name: z.string().trim().min(1, E.name).max(80, E.name),
  business: z.string().refine((v) => businessSchema.safeParse(v).success, E.business),
  contact: z
    .string()
    .trim()
    .min(1, E.contact)
    .max(120, E.contactInvalid)
    .refine((v) => isPhone(v) || isEmail(v), E.contactInvalid),
  kit: z.array(z.enum(BLOCK_IDS)).transform((ids) => sortBlocks(ids)),
  time: z.string().refine((v) => (BOOK_PAGE.times as readonly string[]).includes(v), E.time),
});

export type BookingInput = { name: string; business: string; contact: string; kit: string[]; time: string };
export type Booking = { name: string; business: BusinessId; contact: string; kit: BlockId[]; time: string };
export type FieldErrors = Partial<Record<keyof BookingInput, string>>;

export type ValidationResult = { ok: true; data: Booking } | { ok: false; errors: FieldErrors };

/** Checks the form. Returns the clean booking, or one friendly message per field. */
export function validateBooking(input: BookingInput): ValidationResult {
  const result = bookingSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data as Booking };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof BookingInput | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

export function businessLabel(id: BusinessId): string {
  return KIT.businesses.find((b) => b.id === id)?.label ?? id;
}

/** The mailto: link that carries the request to SITE.email. */
export function bookingMailto(booking: Booking): string {
  const business = businessLabel(booking.business);
  const kit = booking.kit.length ? booking.kit.map((b) => `- ${blockName(b, booking.business)}`).join("\n") : "- Not sure yet";
  const body = [
    BOOK_PAGE.mailIntro,
    "",
    `Name: ${booking.name}`,
    `Business: ${business}`,
    `Phone or email: ${booking.contact}`,
    `Good time to call: ${booking.time}`,
    "",
    "Kit:",
    kit,
  ].join("\n");
  const subject = BOOK_PAGE.mailSubject(booking.name, business);
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
