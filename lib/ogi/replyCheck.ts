import type { OgiProfile } from "./profiles";

/**
 * Lock 5: the check every reply passes before it is sent. It does not trust the prompt. It blocks:
 *   - the name of any other company, product or website builder (and the demo hub's made-up businesses),
 *   - any phone number (onlydevs gives none),
 *   - any money amount or currency (pricing is price on call),
 *   - any email but the onlydevs one, and any link outside the site and the demo hub,
 *   - made-up numbers ("50+ clients", "99%") and timelines in numbers ("in 2 weeks").
 * A blocked reply is replaced with the safe hand-over message.
 * Adapted from the demo hub's clinic check (od-demo-1/lib/ogi/replyCheck.ts).
 */

/**
 * Other companies and products. Matched without case and across spaces, dots and dashes, so "Ticket-Tailor",
 * "HUBSPOT" and "Hub Spot" all match. Names that are also everyday words (Square, Toast, Wednesday) are left out
 * on purpose; the prompt rule covers them. Google is ours to mention: "Website and Google profile" is a service.
 * ShowSalsa is not here: it is the name of our own ticketing demo.
 */
export const OTHER_COMPANY_NAMES = [
  // The demo hub's made-up businesses, and the clinic client. Demos are shown by kind, never by name.
  "Lotus Women's Clinic",
  "Lotus Clinic",
  "Kalyani Tiles",
  "Kalyani",
  "Solstice Roastery",
  "Solstice",
  "Verdant Crest",
  "Nilaya Developers",
  "Nilaya",
  "Bean Street Cafe",
  "Banyan Heights",
  "Meridian Homes",
  "TicketWings",
  "Sky49",
  "Gowthami",
  // Studios and sites used only as inspiration.
  "Codewave",
  "rtCamp",
  "Ideas2IT",
  "wajo",
  "learnwithzero",
  "Lusion",
  "Oryzo",
  // Ticketing.
  "Ticket Tailor",
  "Eventbrite",
  "KonfHub",
  "BookMyShow",
  "Paytm",
  "Ticketmaster",
  "Townscript",
  // Website builders and hosts.
  "Wix",
  "Squarespace",
  "Webflow",
  "WordPress",
  "Shopify",
  "GoDaddy",
  "Weebly",
  "Hostinger",
  // CRMs.
  "Salesforce",
  "HubSpot",
  "Zoho",
  "Pipedrive",
  "Freshworks",
  "Freshsales",
  "LeadSquared",
  "monday.com",
  "Odoo",
  // Bookings, food and property portals.
  "Practo",
  "Zomato",
  "Swiggy",
  "Dineout",
  "OpenTable",
  "Calendly",
  "Petpooja",
  "99acres",
  "MagicBricks",
  "Housing.com",
  "NoBroker",
  "Zillow",
  // Chat and AI vendors.
  "ChatGPT",
  "OpenAI",
  "Gemini",
  "Anthropic",
  "Intercom",
  "Tidio",
  "Zendesk",
  "Freshchat",
  "Interakt",
  "Gupshup",
] as const;

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** One pattern per name: its letters in order, each optionally split by one space, dot, dash, underscore or apostrophe. */
const NAME_PATTERNS = OTHER_COMPANY_NAMES.map(
  (name) => new RegExp(`(?<![a-z0-9])${[...squash(name)].join("[\\s.\\-_'’]?")}(?![a-z0-9])`, "i"),
);

/** Phone-like runs: 7 or more digits, with spaces, dots, dashes or brackets between. */
const PHONE_RUN = /\+?\d[\d\s().-]{5,}\d/g;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function findPhones(text: string) {
  return [...text.matchAll(PHONE_RUN)]
    .map((m) => m[0].trim())
    .filter((run) => !ISO_DATE.test(run) && run.replace(/\D/g, "").length >= 7);
}

/** Any currency, or a number that reads as money. onlydevs has no prices to quote, so any of these is invented. */
const MONEY = [
  /[₹$€£¥]/,
  /\b(?:rs|inr|usd|eur|gbp|aed|sgd)\b\.?\s*\d/i,
  /\d\s*(?:rs|inr|usd|eur|gbp)\b/i,
  /\b(?:rupees?|dollars?|euros?|bucks)\b/i,
  /\d[\d,.]*\s*(?:k|lakhs?|lacs?|crores?|cr)\b/i,
  /\d[\d,.]*\s*\/-/,
  /\d[\d,.]*\s*(?:\/|per|a)\s*(?:month|mo|year|yr|week|hour|hr|page)\b/i,
];

export function hasMoney(text: string) {
  return MONEY.some((re) => re.test(text));
}

/** Made-up proof: "50+ clients", "99% happy", "200 businesses". The site has no such numbers. */
const CLAIM = [/\d\s*\+(?!\d)/, /\d\s*%/, /\d[\d,]*\s+(?:happy\s+)?(?:clients|businesses|customers|projects|reviews|venues|users|brands)\b/i];

/** Timelines in numbers: "in 2 weeks", "three months". The site only says "a few weeks", and a date comes after the call. */
const NUM = "(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)";
const TIMELINE = new RegExp(`\\b${NUM}(?:\\s*(?:-|–|to)\\s*${NUM})?\\s+(?:working\\s+|business\\s+)?(?:days?|weeks?|months?|years?)\\b`, "i");
/** Our own promise, worded either way. */
const REPLY_PROMISE = /\b(?:one|1)\s+working\s+day\b/gi;

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const LINK = /\bhttps?:\/\/[^\s<>"')]+|\bwww\.[^\s<>"')]+/gi;

export type ReplyBlockReason = "company_name" | "phone" | "money" | "email" | "link" | "claim" | "timeline";
export type ReplyCheck = { ok: true } | { ok: false; reasons: ReplyBlockReason[] };

export function checkReply(text: string, { profile }: { profile: OgiProfile }): ReplyCheck {
  const reasons = new Set<ReplyBlockReason>();

  if (NAME_PATTERNS.some((re) => re.test(text))) reasons.add("company_name");
  if (findPhones(text).length) reasons.add("phone");
  if (hasMoney(text)) reasons.add("money");

  for (const email of text.match(EMAIL) ?? []) if (email.toLowerCase() !== profile.contact.email.toLowerCase()) reasons.add("email");

  for (const raw of text.match(LINK) ?? []) {
    const href = raw.replace(/[.,;:!?]+$/, "");
    let origin = "";
    try {
      origin = new URL(href.startsWith("www.") ? `https://${href}` : href).origin;
    } catch {
      /* not a real link: blocked below */
    }
    if (!profile.linkOrigins.includes(origin)) reasons.add("link");
  }

  if (CLAIM.some((re) => re.test(text))) reasons.add("claim");
  if (TIMELINE.test(text.replace(REPLY_PROMISE, ""))) reasons.add("timeline");

  return reasons.size ? { ok: false, reasons: [...reasons] } : { ok: true };
}
