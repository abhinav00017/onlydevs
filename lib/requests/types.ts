import { z } from "zod";
import type { BlockId, BusinessId } from "@/lib/kit";

/** Where a request is in the founders' follow-up. Matches the CHECK constraint in db/schema.sql. */
export const STATUSES = ["new", "contacted", "call_done", "won", "lost"] as const;
export type RequestStatus = (typeof STATUSES)[number];
export const statusSchema = z.enum(STATUSES);

/** Which way the visitor reached the form. "ogi" when Ogi's "Book a free call" link carried source=ogi. */
export const SOURCES = ["form", "ogi"] as const;
export type RequestSource = (typeof SOURCES)[number];

export type ContactKind = "phone" | "email";

/** The UTM tags we keep. Each value is capped (lib/requests/input.ts). */
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

export type CallRequest = {
  id: string;
  /** Short and readable, shown to the visitor and in the admin: "OD-7K3M9Q". */
  ref: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  business: BusinessId;
  contact: string;
  contactKind: ContactKind;
  kit: BlockId[];
  preferredTime: string;
  source: RequestSource;
  utm: Utm | null;
  status: RequestStatus;
  notes: string;
};

export type NewCallRequest = {
  name: string;
  business: BusinessId;
  contact: string;
  contactKind: ContactKind;
  kit: BlockId[];
  preferredTime: string;
  source: RequestSource;
  utm: Utm | null;
};

export type ListFilter = { status?: RequestStatus; business?: BusinessId; q?: string };
export type RequestPatch = { status?: RequestStatus; notes?: string };

/** The admin's top numbers. Every count is over all requests, whatever the list's filters. */
export type RequestCounts = {
  total: number;
  new: number;
  week: number;
  month: number;
  won: number;
  byBusiness: Partial<Record<BusinessId, number>>;
};

/** When "this week" (Monday) and "this month" (the 1st) began. Built by lib/requests/time.ts. */
export type PeriodStarts = { weekStart: Date; monthStart: Date };

/** Most rows the admin list returns at once. */
export const LIST_LIMIT = 500;

export interface CallRequestStore {
  kind: "memory" | "postgres";
  create(input: NewCallRequest): Promise<CallRequest>;
  /** Newest first. */
  list(filter?: ListFilter): Promise<CallRequest[]>;
  /** Null when there is no request with that id. */
  update(id: string, patch: RequestPatch): Promise<CallRequest | null>;
  counts(periods: PeriodStarts): Promise<RequestCounts>;
}
