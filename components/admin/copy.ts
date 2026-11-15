import type { RequestStatus } from "@/lib/requests/types";

/** The admin page's words. Only the founders see this page. */
export const ADMIN = {
  title: "Call requests",
  loading: "Loading…",
  unreachable: "Could not reach the server. Reload the page to try again.",
  notSetUp: {
    title: "Admin is not set up yet",
    line: "This page needs ADMIN_PASSWORD on the server. Set it in Vercel, redeploy, then reload this page.",
  },
  login: {
    title: "Founders only",
    line: "Enter the admin password to see call requests.",
    password: "Password",
    submit: "Log in",
    checking: "Checking…",
    failed: "Could not log in. Try again.",
  },
  logout: "Log out",
  refresh: "Refresh",
  memory: "Test mode: no database is connected, so requests live in memory and vanish on restart.",
  counts: { new: "New", week: "This week", month: "This month", won: "Won", byBusiness: "By business" },
  filters: { search: "Search name or contact", status: "Status", business: "Business", all: "All", clear: "Clear filters" },
  empty: { title: "No requests yet.", line: "When someone books a free call, it shows up here." },
  noMatch: "No requests match these filters.",
  row: { kit: "Kit", noKit: "Not sure yet", time: "Good time", received: "Received", ref: "Ref", open: "Open", close: "Close" },
  editor: { status: "Status", notes: "Notes", notesHint: "Only the founders see these.", save: "Save", saving: "Saving…", saved: "Saved." },
  loadFailed: "Could not load requests. Try again.",
  saveFailed: "Could not save. Try again.",
} as const;

export const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  call_done: "Call done",
  won: "Won",
  lost: "Lost",
};

/** Badge colours: purple for new, quiet greys for the rest, green for won. */
export const STATUS_STYLE: Record<RequestStatus, string> = {
  new: "bg-brand text-white",
  contacted: "bg-brand-soft text-brand-strong",
  call_done: "bg-canvas-deep text-ink",
  won: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  lost: "bg-card text-muted ring-1 ring-line",
};
