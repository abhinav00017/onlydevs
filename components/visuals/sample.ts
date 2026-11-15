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
