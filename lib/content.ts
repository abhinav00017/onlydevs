/**
 * Every word on the site lives here, so the copy is easy to edit in one place.
 * Facts (email, demo links, verticals) live in lib/site.ts. Kit block ids live in lib/kit.ts.
 *
 * Content rules (CLAUDE.md, binding): many verticals, equally; "Business CRM"; WhatsApp only as one reminder
 * channel; "the founders", plural; email is the only contact; price on call; no made-up logos, numbers,
 * reviews or testimonials. tests/content.test.ts checks these.
 */
import type { FixStep } from "@/components/visuals/types";
import type { PhotoId } from "./photos";
import type { BlockId, BusinessId } from "./kit";
import type { VerticalId } from "./site";

export const CTA = {
  book: "Book a free call",
  demos: "See live demos",
  learnMore: "Learn more",
  seeLive: "See it live",
} as const;

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/industries", label: "Industries" },
  { href: "/demos", label: "Demos" },
  { href: "/about", label: "About" },
] as const;

export const FOOTER = {
  more: [
    { href: "/pricing", label: "Pricing" },
    { href: "/book", label: "Book a free call" },
  ],
  emailLabel: "Write to us",
  demoNote: "Every demo is a made-up business, built by us to show what we build.",
} as const;

/* ---------- Home, frame by frame (docs/storyboard.html, section 3) ---------- */

export const HERO = {
  title: ["Running a business is hard.", "Running it on paper is harder."],
  line: "onlydevs builds the software that puts your customers, orders, bookings and leads in one place, whatever your business.",
} as const;

export const PROOF = {
  title: "Don't take our word for it. Click a live demo.",
  chips: [
    { vertical: "clinic", label: "Clinic" },
    { vertical: "cafe", label: "Cafe" },
    { vertical: "realestate", label: "Real estate" },
    { vertical: "events", label: "Ticketing" },
    { vertical: "crm", label: "CRM" },
  ] satisfies { vertical: VerticalId; label: string }[],
  promises: ["You own your site and data.", "The people you talk to build it.", "We reply within one working day."],
} as const;

export const PAIN = {
  text: "Missed calls. Lost leads. Orders on scraps of paper. The same questions, all day long.",
} as const;

export type ServiceSlug =
  | "website-and-google"
  | "orders-bookings-tickets"
  | "crm"
  | "reminders-and-updates"
  | "dashboards"
  | "custom-software";

export type FixSceneCopy = {
  step: FixStep;
  problem: string;
  service: string;
  line: string;
  examples: string;
  href: string;
};

export const FIX = {
  title: "Let's fix that.",
  examplesLabel: "For example",
  scenes: [
    {
      step: 0,
      problem: "Nobody finds you online",
      service: "Website + Google",
      line: "A fast website and a Google profile that bring customers in.",
      examples: "every business",
      href: "/services/website-and-google",
    },
    {
      step: 1,
      problem: "Orders, bookings and tickets in a notebook",
      service: "Online orders, bookings and tickets",
      line: "Customers do it themselves, any time.",
      examples: "a cafe order, a clinic visit, a site visit, an event ticket",
      href: "/services/orders-bookings-tickets",
    },
    {
      step: 2,
      problem: "Leads lost in calls, chats and visiting cards",
      service: "CRM",
      line: "Every lead, quote and follow-up in one list.",
      examples: "a sales team, a real estate office, a showroom",
      href: "/services/crm",
    },
    {
      step: 3,
      problem: "The same questions, all day long",
      service: "An AI assistant",
      line: "Answers questions and takes requests on your website, day and night.",
      examples: "menu and timings, prices, availability",
      href: "/products#ogi",
    },
    {
      step: 4,
      problem: "People forget, and nobody follows up",
      service: "Reminders and updates",
      line: "Automatic confirmations, reminders and follow-ups by email, SMS or WhatsApp.",
      examples: "visits, deliveries, site visits, events",
      href: "/services/reminders-and-updates",
    },
    {
      step: 5,
      problem: "Guessing how the month went",
      service: "Dashboard",
      line: "Sales, orders, bookings and leads on one screen.",
      examples: "every business",
      href: "/services/dashboards",
    },
  ] satisfies FixSceneCopy[],
} as const;

export const CALM = {
  title: "Everything in one place. Stress-free.",
  line: "Your customers, orders, bookings and leads, calm on one screen.",
} as const;

/** Short labels shown on the photos (components/visuals). The photos themselves are listed in lib/photos.ts. */
export const PHOTO_CAPTIONS: Partial<Record<PhotoId, string>> = {
  cafe: "A cafe counter",
  clinic: "A clinic front desk",
  property: "A property viewing",
  assistant: "A customer, after hours",
  events: "An event night",
  team: "A sales team",
};

export const WHO = {
  title: "Built for businesses like yours.",
  line: "Same care for every kind of business. Pick yours to see what matters most.",
  moreLabel: "What we build for",
  other: {
    title: "Something else?",
    line: "If your business runs on calls, paper and chats, we can probably help. Tell us about it.",
  },
} as const;

/* ---------- Industries ---------- */

export type IndustryCopy = {
  /** The page title, plural. */
  title: string;
  intro: string;
  /** The three things that matter most for this business. */
  things: [string, string, string];
  usualDay: string[];
  weBuild: { title: string; line: string; href: string }[];
};

export const INDUSTRIES: Record<VerticalId, IndustryCopy> = {
  clinic: {
    title: "Clinics",
    intro: "Fewer missed calls, fewer empty slots, and more time for patients.",
    things: ["Patients book visits online", "A reminder before every visit", "Questions answered day and night"],
    usualDay: [
      "The phone rings while you are with a patient.",
      "Appointments live in a diary at the front desk.",
      "Patients forget their visit, and the slot goes empty.",
      "The same questions about timings and fees come in all day.",
    ],
    weBuild: [
      { title: "Website and Google profile", line: "Patients find you, see your services and book.", href: "/services/website-and-google" },
      { title: "Appointment booking", line: "Patients pick a slot themselves, any time.", href: "/services/orders-bookings-tickets" },
      { title: "Reminders and updates", line: "A confirmation, then a reminder before the visit.", href: "/services/reminders-and-updates" },
      { title: "AI assistant", line: "Answers timings and fees, and takes visit requests.", href: "/products#ogi" },
      { title: "Dashboard", line: "Today's visits and new patients on one screen.", href: "/services/dashboards" },
    ],
  },
  cafe: {
    title: "Cafes and restaurants",
    intro: "Orders that never get lost, and a menu that is always right.",
    things: ["Orders and table bookings online", "Your menu, always up to date", "Daily sales at a glance"],
    usualDay: [
      "Orders come in by phone, at the counter and in chats.",
      "Someone writes them on a pad, and some get lost.",
      "The menu online is months old.",
      "At closing time, nobody is sure how the day went.",
    ],
    weBuild: [
      { title: "Website with your menu", line: "Your menu, photos, timings and location in one place.", href: "/services/website-and-google" },
      { title: "Online orders and table bookings", line: "Guests order or book a table themselves.", href: "/services/orders-bookings-tickets" },
      { title: "AI assistant", line: "Answers menu and timing questions at any hour.", href: "/products#ogi" },
      { title: "Dashboard", line: "Today's orders and sales at a glance.", href: "/services/dashboards" },
    ],
  },
  realestate: {
    title: "Real estate",
    intro: "Every lead saved, every site visit confirmed, every follow-up on time.",
    things: ["Every lead in one list", "Site visits booked online", "Follow-ups that never slip"],
    usualDay: [
      "Leads arrive from ads, calls, chats and walk-ins.",
      "Visiting cards pile up on the desk.",
      "Site visits clash, or nobody confirms them.",
      "A warm lead goes cold because nobody called back.",
    ],
    weBuild: [
      { title: "Project website", line: "Plans, photos and a clear way to enquire.", href: "/services/website-and-google" },
      { title: "CRM for leads", line: "Every lead with its source, stage and next step.", href: "/services/crm" },
      { title: "Site visit booking", line: "Buyers pick a visit slot themselves.", href: "/services/orders-bookings-tickets" },
      { title: "Reminders and updates", line: "Visit confirmations and follow-ups, sent for you.", href: "/services/reminders-and-updates" },
      { title: "Dashboard", line: "New leads, visits and bookings on one screen.", href: "/services/dashboards" },
    ],
  },
  events: {
    title: "Events and ticketing",
    intro: "Sell tickets on your own site, and know every booking.",
    things: ["Sell tickets on your own site", "Ticket types and discount codes", "Every booking in one place"],
    usualDay: [
      "Tickets sell through chats, forms and cash at the door.",
      "Nobody is sure how many seats are left.",
      "Discounts are tracked by hand.",
      "On the day, the guest list is a messy sheet.",
    ],
    weBuild: [
      { title: "Our ticketing platform", line: "Listings, ticket types, discount codes and passes.", href: "/products#ticketing" },
      { title: "Event website", line: "One home for your events, shows and news.", href: "/services/website-and-google" },
      { title: "Reminders and updates", line: "Booking confirmations and event-day reminders.", href: "/services/reminders-and-updates" },
      { title: "Dashboard", line: "Tickets sold and bookings for each event.", href: "/services/dashboards" },
    ],
  },
  crm: {
    title: "Business CRM",
    intro: "For any team that sells: every customer, quote and follow-up in one list.",
    things: ["Every customer and lead saved", "Quotes and follow-ups on time", "Sales you can see"],
    usualDay: [
      "Walk-ins and calls never get written down.",
      "Quotes are made by hand, then forgotten.",
      "Follow-ups depend on someone's memory.",
      "Nobody can say which leads turned into sales.",
    ],
    weBuild: [
      { title: "CRM", line: "Customers, leads, quotes and follow-ups in one list.", href: "/services/crm" },
      { title: "Reminders and updates", line: "Follow-ups that go out on the right day.", href: "/services/reminders-and-updates" },
      { title: "Dashboard", line: "New leads, quotes and sales on one screen.", href: "/services/dashboards" },
      { title: "Website and Google profile", line: "Customers find you and send an enquiry.", href: "/services/website-and-google" },
    ],
  },
};

export const INDUSTRIES_PAGE = {
  title: "Industries",
  heading: "Built for businesses like yours.",
  intro: "We build for many kinds of business, with the same care for each. Pick yours.",
  dayTitle: "The usual day",
  buildTitle: "What we build for you",
  demoTitle: "See it working",
  demoLine: "Open the live demo. It is a made-up business, built by us.",
  kitLabel: "Book a call for this kit",
} as const;

/* ---------- Services ---------- */

export type ServiceCopy = {
  slug: ServiceSlug;
  name: string;
  short: string;
  problem: string;
  whatYouGet: string[];
  forVerticals: VerticalId[];
  /** Verticals whose live demo shows this service working. Empty means "see all demos". */
  demos: VerticalId[];
};

export const SERVICES: ServiceCopy[] = [
  {
    slug: "website-and-google",
    name: "Website and Google profile",
    short: "A fast website and a Google profile that bring customers in.",
    problem: "Nobody finds you online. Or they find an old page with the wrong timings and no way to reach you.",
    whatYouGet: [
      "A fast website that works well on phones.",
      "A Google profile with your hours, photos and services.",
      "Clear buttons to book, order or enquire.",
      "Pages written so people can find you on Google.",
      "Changes made for you when your details change.",
    ],
    forVerticals: ["clinic", "cafe", "realestate", "events", "crm"],
    demos: ["clinic", "cafe", "realestate"],
  },
  {
    slug: "orders-bookings-tickets",
    name: "Online orders, bookings and tickets",
    short: "Customers order, book or buy tickets themselves, any time.",
    problem: "Orders, bookings and tickets live in a notebook. Some get lost, and some clash.",
    whatYouGet: [
      "Online orders, appointments, table bookings or site visits.",
      "Ticket sales for events and shows.",
      "A confirmation for every booking.",
      "One list of everything coming up.",
      "Rules you control, like open hours and slot limits.",
    ],
    forVerticals: ["clinic", "cafe", "realestate", "events"],
    demos: ["clinic", "events"],
  },
  {
    slug: "crm",
    name: "CRM",
    short: "Every lead, quote and follow-up in one list.",
    problem: "Leads arrive by call, chat and visiting card. Many are never followed up.",
    whatYouGet: [
      "Every lead saved, with where it came from.",
      "Quotes made in minutes.",
      "A follow-up date and a reminder for each lead.",
      "A clear stage for every lead, from new to sold.",
      "A simple screen your team can use on a phone.",
    ],
    forVerticals: ["realestate", "crm", "events"],
    demos: ["crm"],
  },
  {
    slug: "reminders-and-updates",
    name: "Reminders and updates",
    short: "Automatic confirmations, reminders and follow-ups by email, SMS or WhatsApp.",
    problem: "People forget visits, deliveries and events. Nobody has time to call everyone.",
    whatYouGet: [
      "A confirmation as soon as someone books.",
      "A reminder before the visit, delivery or event.",
      "A follow-up afterwards, at the right time.",
      "Messages by email, SMS or WhatsApp, whichever suits you.",
      "Your own words, in your own tone.",
    ],
    forVerticals: ["clinic", "cafe", "realestate", "events", "crm"],
    demos: ["clinic", "crm"],
  },
  {
    slug: "dashboards",
    name: "Dashboards",
    short: "Sales, orders, bookings and leads on one screen.",
    problem: "You find out how the month went at the end of the month, if at all.",
    whatYouGet: [
      "Today's orders, bookings and leads at a glance.",
      "Sales by day, week and month.",
      "What is new, what is due and who needs a call.",
      "It works on your phone.",
    ],
    forVerticals: ["clinic", "cafe", "realestate", "events", "crm"],
    demos: ["crm", "clinic"],
  },
  {
    slug: "custom-software",
    name: "Custom software",
    short: "Something only your business needs, built around how you work.",
    problem: "No ready-made tool fits the way you work. So it runs on spreadsheets and memory.",
    whatYouGet: [
      "A tool shaped around how you already work.",
      "Built step by step, and you see each step.",
      "Connected to the tools you already use, where we can.",
      "Looked after every month.",
    ],
    forVerticals: ["clinic", "cafe", "realestate", "events", "crm"],
    demos: [],
  },
];

export function serviceBySlug(slug: string): ServiceCopy | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export const SERVICES_PAGE = {
  title: "Services",
  heading: "What we build.",
  intro: "Pick one, or put a few together in a kit. We build it, set it up and look after it.",
  problemTitle: "The problem",
  getTitle: "What you get",
  forTitle: "Who uses it",
  demoTitle: "See it working",
  demoLine: "Open a live demo. Each one is a made-up business, built by us.",
  noDemoLine: "Every build is different. Browse the live demos to see how we work.",
} as const;

/* ---------- Products ---------- */

export const PRODUCTS = {
  title: "Ready-made, and yours to use today.",
  pageHeading: "Our products.",
  pageIntro: "Two ready-made products. Try each one live before you call us.",
  featuresTitle: "What it does",
  forTitle: "Who it is for",
  ticketing: {
    id: "ticketing",
    name: "Our ticketing platform",
    line: "Sell tickets online for events and shows.",
    forWho: "Event organisers, venues, clubs and anyone who runs shows or workshops.",
    button: "Try the ticketing demo",
    demoNote: "The demo is called ShowSalsa. It is a made-up platform, built by us.",
    // Only features the ShowSalsa demo really has (od-demo-1/demos/showsalsa). Source file beside each.
    features: [
      // ShowSalsaApp.tsx, HeroCarousel.tsx
      { title: "Events people can browse", line: "A featured carousel, a trending list and handpicked picks." },
      // data.ts filterEvents, Navbar.tsx
      { title: "Search and filters", line: "Find events by city, category or date, or search by artist or venue." },
      // EventDetailDrawer.tsx
      { title: "A page for every event", line: "Dates, entry times, lineup, venue and entry rules." },
      // EventDetailDrawer.tsx (handleUpdateQty), data.ts TicketTier.availableCount
      { title: "Ticket types", line: "Several ticket types per event, each with its own price, perks and seat limit." },
      // data.ts calculateCartTotals
      { title: "Discount codes", line: "Codes that take a percentage or a fixed amount off." },
      // data.ts calculateCartTotals
      { title: "A clear total", line: "Ticket price, booking fee, tax and discount, shown before checkout." },
      // data.ts checkoutError
      { title: "Simple checkout", line: "Name, email and phone, checked before the booking goes through." },
      // EventDetailDrawer.tsx (confirmed booking), BookingsDrawer.tsx
      { title: "Passes in one place", line: "Each booking gets a pass with its own number, kept under My passes." },
      // ListEventModal.tsx, data.ts listingToEvent
      { title: "List your event", line: "Organisers fill a short form, and the event shows up on the site." },
    ],
  },
  ogi: {
    id: "ogi",
    name: "Ogi",
    line: "The AI assistant for your website.",
    forWho: "Any business that answers the same questions all day.",
    button: "Try Ogi live",
    demoNote: "Ogi is live on our clinic demo website. Open the chat bubble there.",
    previewLabel: "An example chat on a clinic website",
    preview: [
      { from: "visitor", text: "Are you open this Sunday?" },
      { from: "ogi", text: "Yes, on Sunday mornings. Would you like me to request a visit?" },
      { from: "visitor", text: "Yes, please." },
      { from: "ogi", text: "Sure. Please confirm your name and a good time, and the clinic will get back to you." },
    ] satisfies { from: "visitor" | "ogi"; text: string }[],
    features: [
      { title: "Answers from your details", line: "Timings, prices, services and more, from what you tell us." },
      { title: "Takes requests", line: "Visit and booking requests, with a confirm step before anything is sent." },
      { title: "Hands over to your team", line: "When Ogi is not sure, it passes the chat to a person." },
      { title: "Day and night", line: "On your website at any hour, so no question waits till morning." },
    ],
  },
} as const;

/* ---------- Kit builder (storyboard section 4) ---------- */

export const KIT = {
  title: "Build your kit in 30 seconds.",
  line: "Pick your business. We suggest the blocks. Tap to add or remove.",
  step1: "1. Your business",
  step2: "2. Your kit",
  step3: "3. Book a call for this kit",
  button: "Book a call for this kit",
  empty: "Your kit is empty. Tap a block to add it.",
  countLabel: (n: number) => (n === 1 ? "1 block in your kit" : `${n} blocks in your kit`),
  suggested: "Suggested",
  businesses: [
    { id: "clinic", label: "Clinic" },
    { id: "cafe", label: "Cafe and restaurant" },
    { id: "realestate", label: "Real estate" },
    { id: "events", label: "Events and ticketing" },
    { id: "crm", label: "Business CRM" },
    { id: "other", label: "Something else" },
  ] satisfies { id: BusinessId; label: string }[],
  blocks: {
    website: { name: "Website and Google profile", line: "Customers find you and trust you." },
    orders: { name: "Online orders and bookings", line: "Customers order or book themselves." },
    ticketing: { name: "Ticketing platform", line: "Sell tickets for events and shows." },
    crm: { name: "CRM", line: "Every lead and follow-up in one list." },
    ogi: { name: "AI assistant", line: "Answers questions on your website, day and night." },
    reminders: { name: "Reminders and updates", line: "Confirmations and reminders, sent for you." },
    dashboard: { name: "Dashboard", line: "Your numbers on one screen." },
  } satisfies Record<BlockId, { name: string; line: string }>,
  /** Some blocks have a better name for a given business. */
  blockNames: {
    clinic: { orders: "Appointment booking" },
    cafe: { orders: "Online orders and table bookings", website: "Website with your menu" },
    realestate: { orders: "Site visit booking", crm: "CRM for leads" },
    events: { website: "Event website" },
  } satisfies Partial<Record<BusinessId, Partial<Record<BlockId, string>>>>,
} as const;

export function blockName(block: BlockId, business?: BusinessId): string {
  const names = business ? (KIT.blockNames as Partial<Record<BusinessId, Partial<Record<BlockId, string>>>>)[business] : undefined;
  return names?.[block] ?? KIT.blocks[block].name;
}

/* ---------- How it works, founders, FAQ, the end ---------- */

export const HOW = {
  title: "A free call. A few weeks. You're live.",
  steps: [
    { title: "A free call", line: "We talk about your business and what slows you down." },
    { title: "A live demo", line: "We show you what you would get, working." },
    { title: "We build it", line: "We build and set it up. You see each step." },
    { title: "You go live", line: "You start using it, and we look after it every month." },
  ],
} as const;

/** Exact text from docs/storyboard.html section 7. Do not edit without the founders. */
export const FOUNDERS_NOTE = {
  title: "Why we started onlydevs.",
  paragraphs: [
    "We started onlydevs for one reason.",
    "Good local businesses lose customers every day. A call is missed. A lead is forgotten. An order sits on a scrap of paper.",
    "Big companies have software for this. Most small businesses don't. We build it for them.",
    "We keep it simple. We set it up for you, and we look after it every month. You talk to the people who build it. You own your website and your data.",
    "If that sounds useful, book a free call. No pressure, just a conversation.",
  ],
  signature: "The founders, onlydevs",
} as const;

export const FAQ = {
  title: "Questions owners ask us.",
  items: [
    {
      q: "How much does it cost?",
      a: "We quote after a free call, once we know what you need. Most work is a one-time setup, then a small monthly fee. You know the price before we start.",
    },
    {
      q: "How long does it take?",
      a: "Most kits go live in a few weeks. Bigger builds take longer. We give you a clear date after the free call.",
    },
    {
      q: "Do I need to be technical?",
      a: "No. We set everything up and show you how to use it. If something breaks, we fix it.",
    },
    {
      q: "Do I own my website and data?",
      a: "Yes. Your website and your data are yours. If you ever leave, you take them with you.",
    },
    {
      q: "Is my customers' data safe?",
      a: "We collect only what you need, and only you and the people you choose can see it. We never sell it or share it.",
    },
    {
      q: "Do you work with my kind of business?",
      a: "Very likely. We build for clinics, cafes and restaurants, real estate, events and ticketing, and any team that needs a CRM. Tell us about yours on the call.",
    },
    {
      q: "Can you add to what I already have?",
      a: "Yes. We can work with your current website and tools, or replace them step by step. We look at what you have on the free call.",
    },
  ],
} as const;

export const END = {
  title: "Let's make your business stress-free.",
  line: "Book a free call, or write to us.",
} as const;

export const BOTTOM_BAR = {
  line: "Free call. No pressure.",
} as const;

/* ---------- Other pages ---------- */

export const DEMOS_PAGE = {
  title: "Live demos",
  heading: "Click a live demo.",
  intro: "Every demo is a working app for a made-up business, built by us. Tap around and try it.",
  open: "Open the demo",
  hubLine: "All demos live together on our demo site.",
  hubButton: "Open the demo site",
  items: {
    clinic: "A clinic website with online appointment booking, a clinic dashboard and an AI chat assistant.",
    cafe: "A cafe website with its menu, timings and table reservations.",
    realestate: "A real estate project website with plans, answers and an enquiry form.",
    events: "Our ticketing platform, in a demo called ShowSalsa.",
    crm: "A CRM for a showroom: leads, quotes and follow-ups.",
  } satisfies Record<VerticalId, string>,
} as const;

export const PRICING_PAGE = {
  title: "Pricing",
  heading: "Price on call.",
  intro: "We quote after a free call, once we know what you need. There is no charge for the call.",
  partsTitle: "How pricing works",
  parts: [
    { title: "A one-time setup", line: "We build your kit and set it up for you. You pay this once." },
    { title: "A small monthly fee", line: "We look after it every month: hosting, updates, fixes and help." },
  ],
  factorsTitle: "What changes the price",
  factors: [
    "Which blocks are in your kit.",
    "How many pages, services or products you have.",
    "Whether we connect to tools you already use.",
  ],
  whyTitle: "Why no price list?",
  why: "Every business needs a different kit. A fixed list would make you pay for things you do not use. So we listen first, then give you one clear price before we start.",
} as const;

export const ABOUT_PAGE = {
  title: "About",
  heading: "About onlydevs.",
  intro: "We build and look after software for local businesses and growing teams.",
  promisesTitle: "Our promises",
  promises: [
    { title: "You own your site and data.", line: "If you ever leave, you take them with you." },
    { title: "The people you talk to build it.", line: "No hand-offs. The founders are on your calls." },
    { title: "We reply within one working day.", line: "Write to us, and you hear back by the next working day." },
    { title: "We look after it every month.", line: "Updates, fixes and help, for as long as you use it." },
  ],
} as const;

export const BOOK_PAGE = {
  title: "Book a free call",
  heading: "Book a free call.",
  intro: "Tell us a little about your business. We reply within one working day.",
  fields: {
    name: { label: "Your name", hint: "" },
    business: { label: "Your business", placeholder: "Pick one" },
    contact: { label: "Your phone number or email", hint: "So we can call or write back." },
    kit: { label: "Your kit", hint: "Optional. Pick what you might need." },
    time: { label: "A good time to call" },
  },
  times: ["Any time", "Weekday morning", "Weekday afternoon", "Weekday evening", "Weekend"],
  errorsTitle: "Please fix these and try again:",
  errors: {
    name: "Please tell us your name.",
    business: "Please pick your kind of business.",
    contact: "Please add a phone number or an email we can reach you on.",
    contactInvalid: "That does not look like a phone number or an email. Please check it.",
    time: "Please pick a good time to call.",
  },
  submit: "Send my request",
  sentTitle: "Your email app should open now.",
  sentLine: "Your request is written for you. Just press send. If nothing opened, write to us directly at",
  privacy: "We use your details only to call you back. We never share them.",
  emailDirect: "Prefer to write? Email us at",
  mailSubject: (name: string, business: string) => `Free call request: ${name}, ${business}`,
  mailIntro: "Hi onlydevs, I would like a free call.",
} as const;

export const NOT_FOUND = {
  heading: "This page is not here.",
  line: "It may have moved. Try the home page, or book a free call.",
  home: "Go to the home page",
} as const;

/* ---------- Metadata ---------- */

export const META = {
  home: {
    title: "onlydevs: software that makes business easy and stress-free",
    description:
      "onlydevs builds and looks after websites, bookings, CRMs, reminders, dashboards and an AI assistant for local businesses.",
  },
  services: { title: "Services", description: "Websites, online orders and bookings, CRMs, reminders, dashboards and custom software, built and looked after by onlydevs." },
  products: { title: "Products", description: "Our ticketing platform and Ogi, the AI assistant for your website. Try each one live." },
  industries: { title: "Industries", description: "Software for clinics, cafes and restaurants, real estate, events and ticketing, and any team that needs a CRM." },
  demos: { title: "Live demos", description: "Click a live demo. Working apps for made-up businesses, built by onlydevs." },
  pricing: { title: "Pricing", description: "Price on call: a one-time setup, then a small monthly fee, quoted after a free call." },
  about: { title: "About", description: "A note from the founders of onlydevs, and the promises we keep." },
  book: { title: "Book a free call", description: "Tell us about your business and book a free call with the onlydevs founders." },
} as const;
