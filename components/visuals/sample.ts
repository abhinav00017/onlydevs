/**
 * Made-up sample data for the floating product screens. These are demo screens, not claims:
 * every name and number here is invented. Neutral and global: no currency, no country-specific terms.
 * tests/visuals.test.tsx scans this file for country-specific words, as it does lib/content.ts.
 */

/** Hero: the everyday chaos. */
export const CHAOS = {
  missedCall: { title: "Missed calls", from: "Sofia Marin", count: "3 missed calls", when: "now" },
  slip: {
    title: "Table 6",
    lines: ["2 flat white", "1 almond croissant", "oat milk??", "1 pot of tea"],
    note: "paid? ask Mateo",
  },
  stickies: [
    { text: "Call back Mr Okafor about the quote!!" },
    { text: "Lena F. moved to Thu? check" },
  ],
  messages: {
    app: "Messages",
    unread: "12",
    items: [
      { from: "Hana", text: "Are you open on Sunday?" },
      { from: "Diego", text: "Is the 7 pm slot still free?" },
      { from: "Aisha", text: "Hello? Still waiting to hear back" },
    ],
  },
  clash: {
    day: "Tue 14",
    label: "Double booked",
    events: [
      { time: "10:00", who: "Lena Fischer", what: "Check-up" },
      { time: "10:00", who: "Kenji Watanabe", what: "Consultation" },
    ],
  },
} as const;

/** Fix scene 0: found online. */
export const SEARCH = {
  query: "cafe near me",
  name: "Bluebird Cafe",
  kind: "Cafe",
  status: "Open now",
  closes: "Closes 6 pm",
  actions: ["Website", "Directions", "Order"],
  site: { url: "bluebird-cafe.example", headline: "Fresh coffee, all day.", cta: "Order online" },
} as const;

/** Fix scene 1: bookings, orders and tickets, across verticals. */
export const BOOKINGS = {
  title: "Today",
  subtitle: "New, booked online",
  items: [
    { kind: "Table", what: "Table for 4", when: "7:30 pm", who: "Mateo Rossi" },
    { kind: "Visit", what: "Check-up", when: "10:00", who: "Lena Fischer" },
    { kind: "Viewing", what: "Site visit", when: "2:00 pm", who: "Hana Kim" },
    { kind: "Tickets", what: "2 tickets, Jazz Night", when: "Sat", who: "Kwame Mensah" },
  ],
  status: "Confirmed",
  newLabel: "4 new",
} as const;

/** Fix scene 2: one lead in the CRM. */
export const LEAD = {
  name: "Amara Okafor",
  initials: "AO",
  source: "Website form",
  interest: "2-bed apartment, Riverside",
  stages: ["New", "Contacted", "Viewing", "Offer"],
  stage: 2,
  followUpLabel: "Next follow-up",
  followUp: "Thu, 11:00",
  followUpTask: "Call back after the viewing",
  owner: "Noah",
  ownerLabel: "Owner",
} as const;

/** Fix scene 3: the AI assistant on a website. */
export const CHAT = {
  title: "AI assistant",
  status: "Online",
  messages: [
    { from: "visitor", text: "Do you have a table for two tonight?" },
    { from: "assistant", text: "Yes, 7:30 pm is free. Shall I book it for you?" },
    { from: "visitor", text: "Yes please. Chloe Martin." },
    { from: "assistant", text: "Done, Chloe. A confirmation is on its way by email." },
  ],
} as const;

/** Fix scene 4: a reminder, sent for you. */
export const REMINDER = {
  app: "Jazz Night",
  when: "now",
  title: "Tonight at 7 pm",
  body: "Doors open at 6:30. Show this ticket at the door.",
  ticket: "2 tickets, Row F",
  behind: { app: "Clinic", title: "Your visit is tomorrow at 10:00" },
} as const;

/** Fix scene 5 and the calm frame: a small dashboard. */
export const DASHBOARD = {
  title: "This week",
  demo: "Sample data",
  stats: [
    { label: "Orders", value: "248", delta: "+12%" },
    { label: "Bookings", value: "64", delta: "+8%" },
    { label: "New leads", value: "31", delta: "+5%" },
  ],
  /** Seven days, for the small chart. */
  series: [32, 41, 36, 48, 44, 58, 63],
  days: ["M", "T", "W", "T", "F", "S", "S"],
} as const;

/** The calm frame: the owner's phone. */
export const CALM_PHONE = {
  time: "9:41",
  greeting: "Good morning",
  title: "All caught up",
  items: [
    { text: "12 bookings confirmed" },
    { text: "Reminders sent" },
    { text: "3 new leads assigned" },
    { text: "Orders ready for pickup" },
  ],
} as const;

/**
 * The hero device: the live screens on the phone and the laptop, one set per business, in cycle order.
 * `seed` is on screen at the start; `incoming` arrives one item at a time. `add` moves the live count.
 * Every screen shows the "Sample data" tag: these are demo screens, not claims.
 */
export type HeroFeedItem = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  status: string;
  /** How much this item adds to the live count. Default 1. */
  add?: number;
  /** CRM only: the stage the lead is now in, as an index into `stages`. */
  stage?: number;
};

export type HeroScreen = {
  app: string;
  section: string;
  nav: readonly string[];
  count: { label: string; start: number; of?: number };
  tiles: readonly { label: string; value: string }[];
  stages?: readonly string[];
  seed: readonly HeroFeedItem[];
  incoming: readonly HeroFeedItem[];
};

export const HERO_SCREENS = {
  tag: "Sample data",
  time: "9:41",
  today: "Today",
  week: "This week",
  cafe: {
    app: "Bluebird Cafe",
    section: "Orders",
    nav: ["Today", "Orders", "Menu", "Customers", "Reports"],
    count: { label: "Orders today", start: 38 },
    tiles: [
      { label: "Ordered online", value: "72%" },
      { label: "Average wait", value: "6 min" },
    ],
    seed: [
      { id: "cafe-0", title: "Order 1039", detail: "2 espresso, 1 lemon cake", meta: "Table 2", status: "Served" },
      { id: "cafe-1", title: "Order 1040", detail: "1 pot of tea, 1 scone", meta: "Pickup", status: "Ready" },
      { id: "cafe-2", title: "Order 1041", detail: "2 flat white, 1 almond croissant", meta: "Table 6", status: "Preparing" },
    ],
    incoming: [
      { id: "cafe-3", title: "Order 1042", detail: "1 oat latte, 1 banana bread", meta: "Pickup, Hana", status: "New" },
      { id: "cafe-4", title: "Order 1043", detail: "2 cappuccino, 2 toasties", meta: "Table 3", status: "New" },
      { id: "cafe-5", title: "Order 1044", detail: "1 cold brew, 1 granola bowl", meta: "Delivery", status: "New" },
    ],
  },
  clinic: {
    app: "Northside Clinic",
    section: "Bookings",
    nav: ["Today", "Bookings", "Patients", "Reminders", "Reports"],
    count: { label: "Bookings today", start: 14 },
    tiles: [
      { label: "Booked online", value: "9" },
      { label: "Reminders sent", value: "12" },
    ],
    seed: [
      { id: "clinic-0", title: "Check-up", detail: "Mateo Rossi", meta: "09:30", status: "Checked in" },
      { id: "clinic-1", title: "Check-up", detail: "Lena Fischer", meta: "10:00", status: "Confirmed" },
      { id: "clinic-2", title: "Follow-up", detail: "Kenji Watanabe", meta: "10:30", status: "Confirmed" },
    ],
    incoming: [
      { id: "clinic-3", title: "Consultation", detail: "Sofia Marin", meta: "11:15", status: "Booked" },
      { id: "clinic-4", title: "Check-up", detail: "Diego Alvarez", meta: "12:00", status: "Booked" },
      { id: "clinic-5", title: "Follow-up", detail: "Aisha Rahman", meta: "14:30", status: "Booked" },
    ],
  },
  crm: {
    app: "Brightline Studio",
    section: "Leads",
    nav: ["Today", "Leads", "Pipeline", "Follow-ups", "Reports"],
    count: { label: "Open leads", start: 23 },
    tiles: [
      { label: "Follow-ups today", value: "7" },
      { label: "New this week", value: "11" },
    ],
    stages: ["New", "Contacted", "Proposal", "Won"],
    seed: [
      { id: "crm-0", title: "Lena Fischer", detail: "Call booked", meta: "Wed", status: "Contacted", stage: 1 },
      { id: "crm-1", title: "Amara Okafor", detail: "Website form", meta: "Thu", status: "Contacted", stage: 1 },
      { id: "crm-2", title: "Noah Becker", detail: "Referral", meta: "Fri", status: "Proposal", stage: 2 },
    ],
    incoming: [
      { id: "crm-3", title: "Mateo Rossi", detail: "Moved to Proposal", meta: "now", status: "Proposal", stage: 2, add: 0 },
      { id: "crm-4", title: "Chloe Martin", detail: "New lead, website form", meta: "now", status: "New", stage: 0 },
      { id: "crm-5", title: "Kwame Mensah", detail: "Moved to Won", meta: "now", status: "Won", stage: 3, add: 0 },
    ],
  },
  events: {
    app: "Jazz Night",
    section: "Tickets",
    nav: ["Today", "Events", "Tickets", "Check-in", "Reports"],
    count: { label: "Tickets sold", start: 186, of: 240 },
    tiles: [
      { label: "Checked in", value: "0" },
      { label: "Doors open", value: "6:30 pm" },
    ],
    seed: [
      { id: "events-0", title: "2 tickets", detail: "Sofia Marin", meta: "Row A", status: "Paid", add: 2 },
      { id: "events-1", title: "2 tickets", detail: "Kwame Mensah", meta: "Row F", status: "Paid", add: 2 },
      { id: "events-2", title: "4 tickets", detail: "Lena Fischer", meta: "Row C", status: "Paid", add: 4 },
    ],
    incoming: [
      { id: "events-3", title: "2 tickets", detail: "Hana Kim", meta: "Row D", status: "Paid", add: 2 },
      { id: "events-4", title: "1 ticket", detail: "Tom Becker", meta: "Row H", status: "Paid", add: 1 },
      { id: "events-5", title: "3 tickets", detail: "Chloe Martin", meta: "Row B", status: "Paid", add: 3 },
    ],
  },
} as const satisfies { tag: string; time: string; today: string; week: string } & Record<"cafe" | "clinic" | "crm" | "events", HeroScreen>;
