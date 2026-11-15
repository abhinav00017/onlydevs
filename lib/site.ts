/** Site-wide facts. Change them here, nowhere else. */
export const SITE = {
  name: "onlydevs",
  domain: "onlydevs.co.in",
  tagline: "Making business easy and stress-free.",
  email: "onlydevs2002@gmail.com",
  /** The demo hub. Moves to https://demos.onlydevs.co.in once its DNS is live. */
  demoBaseUrl: "https://od-demo-lyart.vercel.app",
} as const;

/** The verticals we serve, equal weight, in display order. `demoPath` is a path on the demo hub. */
export const VERTICALS = [
  { id: "clinic", name: "Clinic", demoPath: "/clinic" },
  { id: "cafe", name: "Cafe and restaurant", demoPath: "/cafe" },
  { id: "realestate", name: "Real estate", demoPath: "/real-estate" },
  { id: "events", name: "Events and ticketing", demoPath: "/ticketing-platform" },
  { id: "crm", name: "Business CRM", demoPath: "/tiles" },
] as const;

export type VerticalId = (typeof VERTICALS)[number]["id"];

export function demoUrl(path: string): string {
  return `${SITE.demoBaseUrl}${path}`;
}
