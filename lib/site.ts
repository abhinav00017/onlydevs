/** Site-wide facts. Change them here, nowhere else. */
export const SITE = {
  name: "onlydevs",
  domain: "onlydevs.co.in",
  url: "https://onlydevs.co.in",
  tagline: "Making business easy and stress-free.",
  email: "onlydevs2002@gmail.com",
  /** The demo hub. Moves to https://demos.onlydevs.co.in once its DNS is live. */
  demoBaseUrl: "https://od-demo-lyart.vercel.app",
} as const;

/**
 * The verticals we serve, equal weight, in display order.
 * `slug` is the page under /industries. `demoPath` is the vertical's page on the demo hub.
 * `liveDemoPath` opens that vertical's working demo directly.
 */
export const VERTICALS = [
  { id: "clinic", slug: "clinics", name: "Clinic", demoPath: "/clinic", liveDemoPath: "/clinic/website" },
  { id: "cafe", slug: "cafes-and-restaurants", name: "Cafe and restaurant", demoPath: "/cafe", liveDemoPath: "/cafe/website" },
  { id: "realestate", slug: "real-estate", name: "Real estate", demoPath: "/real-estate", liveDemoPath: "/real-estate/website" },
  {
    id: "events",
    slug: "events-and-ticketing",
    name: "Events and ticketing",
    demoPath: "/ticketing-platform",
    liveDemoPath: "/ticketing-platform/ticketing-platform",
  },
  { id: "crm", slug: "business-crm", name: "Business CRM", demoPath: "/tiles", liveDemoPath: "/tiles/crm" },
] as const;

export type Vertical = (typeof VERTICALS)[number];
export type VerticalId = Vertical["id"];

/** The products' own demos on the demo hub. Ogi lives on the clinic demo website for now. */
export const PRODUCT_DEMOS = {
  ticketing: "/ticketing-platform/ticketing-platform",
  ogi: "/clinic/website",
} as const;

export function demoUrl(path: string): string {
  return `${SITE.demoBaseUrl}${path}`;
}

export function getVertical(id: VerticalId): Vertical {
  return VERTICALS.find((v) => v.id === id)!;
}

export function verticalBySlug(slug: string): Vertical | undefined {
  return VERTICALS.find((v) => v.slug === slug);
}

export function isVerticalId(value: unknown): value is VerticalId {
  return typeof value === "string" && VERTICALS.some((v) => v.id === value);
}
