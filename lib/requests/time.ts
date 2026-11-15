import type { PeriodStarts } from "./types";

/**
 * The founders' time zone, for "this week" and "this month" on the admin page. Only the admin counts use it;
 * visitors never see it.
 */
export const ADMIN_TIME_ZONE = "Asia/Kolkata";

/** The wall-clock date in `timeZone` at `now`. */
function zonedParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric", day: "numeric", weekday: "short" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { year: Number(get("year")), month: Number(get("month")), day: Number(get("day")), weekday: get("weekday") };
}

/** Milliseconds `timeZone` is ahead of UTC at `at`. */
function offsetMs(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** The instant midnight starts on that calendar day in `timeZone`. */
function midnight(year: number, month: number, day: number, timeZone: string) {
  const guess = new Date(Date.UTC(year, month - 1, day));
  return new Date(guess.getTime() - offsetMs(guess, timeZone));
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** This week starts on Monday at midnight, this month on the 1st at midnight, both in `timeZone`. */
export function periodStarts(now = new Date(), timeZone = ADMIN_TIME_ZONE): PeriodStarts {
  const { year, month, day, weekday } = zonedParts(now, timeZone);
  const back = Math.max(0, WEEKDAYS.indexOf(weekday));
  // Date.UTC rolls a negative day back into the previous month, so Monday is always a real date.
  const monday = new Date(Date.UTC(year, month - 1, day - back));
  return {
    weekStart: midnight(monday.getUTCFullYear(), monday.getUTCMonth() + 1, monday.getUTCDate(), timeZone),
    monthStart: midnight(year, month, 1, timeZone),
  };
}
