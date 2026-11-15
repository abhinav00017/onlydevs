import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import * as content from "@/lib/content";
import { SITE, VERTICALS } from "@/lib/site";

/**
 * The content rules from CLAUDE.md, checked as text. Two views of the copy:
 * the source of lib/content.ts, and every string the module exports (functions called with sample values).
 */
const source = readFileSync(resolve(process.cwd(), "lib/content.ts"), "utf8");
// Only the copy, not the comments at the top of the file that explain the rules.
const sourceCopy = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "function") {
    const fn = value as (...args: unknown[]) => unknown;
    const result = fn.length === 0 ? fn() : fn("Asha", "Clinic");
    collectStrings(result, out);
  } else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

const exported = collectStrings(Object.fromEntries(Object.entries(content).filter(([k]) => k !== "blockName" && k !== "serviceBySlug")));
const all = exported.join("\n");
const texts = [
  ["exported copy", all],
  ["lib/content.ts", sourceCopy],
] as const;

describe.each(texts)("content rules in %s", (_name, text) => {
  it("never says tiles or tile showrooms", () => {
    expect(text).not.toMatch(/\btiles?\b/i);
  });

  it("speaks as the founders, plural, and never names one founder", () => {
    expect(text).not.toMatch(/\bfounder\b(?!s)/i);
    expect(text).not.toMatch(/\b(CEO|co-founder|cofounder)\b/i);
  });

  it("mentions WhatsApp only as one reminder channel, next to email and SMS", () => {
    const outsideChannelList = text.replace(/email, SMS or WhatsApp/g, "");
    expect(outsideChannelList).not.toMatch(/whatsapp/i);
  });

  it("shows no phone number", () => {
    expect(text).not.toMatch(/\+?\d[\d\s-]{7,}\d/);
    expect(text).not.toMatch(/\bcall us on\b|\bphone:\s*\d/i);
  });

  it("names no city", () => {
    expect(text).not.toMatch(/Hyderabad|Visakhapatnam|Vizag|Bengaluru|Bangalore|Mumbai|Delhi|Chennai|Pune|Kolkata|Goa|Tellapur/i);
  });

  it("uses no email but the onlydevs one", () => {
    const emails = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [];
    for (const email of emails) expect(email).toBe(SITE.email);
  });

  it("shows no prices: price on call", () => {
    expect(text).not.toMatch(/[₹€£]|\$\s*\d|\bRs\.?\s*\d|\bINR\b|\bper month\b.*\d|\d+\s*\/\s*month/i);
  });

  it("makes up no numbers, logos, reviews or testimonials", () => {
    expect(text).not.toMatch(/\d+\s*\+|\d+\s*%|\d+\s*(clients|businesses|customers|projects|venues|reviews)\b/i);
    expect(text).not.toMatch(/testimonial|trusted by|as seen in|★|stars? rating|5-star|our clients say/i);
  });

  it("calls the ticketing product our ticketing platform, and ShowSalsa only the demo", () => {
    for (const match of text.matchAll(/ShowSalsa/g)) {
      const around = text.slice(Math.max(0, (match.index ?? 0) - 60), (match.index ?? 0) + 60);
      expect(around).toMatch(/demo/i);
    }
  });

  it("never mentions Dr. Gowthami", () => {
    expect(text).not.toMatch(/gowthami/i);
  });
});

describe("content shape", () => {
  it("keeps the founders' note exactly as the storyboard wrote it", () => {
    expect(content.FOUNDERS_NOTE.paragraphs).toEqual([
      "We started onlydevs for one reason.",
      "Good local businesses lose customers every day. A call is missed. A lead is forgotten. An order sits on a scrap of paper.",
      "Big companies have software for this. Most small businesses don't. We build it for them.",
      "We keep it simple. We set it up for you, and we look after it every month. You talk to the people who build it. You own your website and your data.",
      "If that sounds useful, book a free call. No pressure, just a conversation.",
    ]);
    expect(content.FOUNDERS_NOTE.signature).toBe("The founders, onlydevs");
  });

  it("has the six services and six fix scenes from the storyboard", () => {
    expect(content.SERVICES.map((s) => s.slug)).toEqual([
      "website-and-google",
      "orders-bookings-tickets",
      "crm",
      "reminders-and-updates",
      "dashboards",
      "custom-software",
    ]);
    expect(content.FIX.scenes.map((s) => s.step)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("gives every vertical equal copy: three things, a usual day and what we build", () => {
    for (const v of VERTICALS) {
      const copy = content.INDUSTRIES[v.id];
      expect(copy.things).toHaveLength(3);
      expect(copy.usualDay.length).toBeGreaterThanOrEqual(3);
      expect(copy.weBuild.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("names Ogi only as one of our two products, never as the site's guide", () => {
    const { PRODUCTS, META, ...rest } = content;
    const outsideProducts = collectStrings(Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "blockName" && k !== "serviceBySlug")));
    expect(outsideProducts.join("\n")).not.toMatch(/\bOgi\b/);
    expect(collectStrings(PRODUCTS).join("\n")).toMatch(/\bOgi\b/);
    expect(META.products.description).toMatch(/Ogi/);
  });

  it("puts no Ogi mascot on any page (Abhinav, 15 Nov 2026: Ogi is a product, not the guide)", () => {
    const files = [
      "app/page.tsx",
      "app/layout.tsx",
      "components/home/frames.tsx",
      "components/home/shared.tsx",
      "components/home/StressFree.tsx",
      "components/home/KitBuilder.tsx",
      "components/site/Header.tsx",
      "components/site/BottomBar.tsx",
      "app/industries/[slug]/page.tsx",
      "app/demos/page.tsx",
      "app/products/page.tsx",
    ];
    for (const file of files) {
      const text = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(text, file).not.toMatch(/Ogi3D|Ogi3DFallback|ogi[\w-]*\.svg/);
    }
  });

  it("answers the seven questions owners ask", () => {
    expect(content.FAQ.items.map((i) => i.q)).toEqual([
      "How much does it cost?",
      "How long does it take?",
      "Do I need to be technical?",
      "Do I own my website and data?",
      "Is my customers' data safe?",
      "Do you work with my kind of business?",
      "Can you add to what I already have?",
    ]);
  });

  it("keeps sentences short: under 20 words each", () => {
    const sentences = exported.flatMap((str) => str.split(/(?<=[.?!])\s+/));
    for (const s of sentences) expect(s.split(/\s+/).length, s).toBeLessThan(20);
  });
});
