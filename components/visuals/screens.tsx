import {
  ArrowUpRight,
  CalendarClock,
  Check,
  CircleCheck,
  House,
  MapPin,
  Search,
  Send,
  Sparkles,
  Stethoscope,
  Ticket,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { cx } from "@/components/site/ui";
import { BOOKINGS, CALM_PHONE, CHAT, DASHBOARD, LEAD, REMINDER, SEARCH } from "./sample";
import { Avatar, Pill, UiCard, initialsOf } from "./ui";

/**
 * Our product, drawn in HTML and CSS so it stays crisp at any size. Sized in `em` (see SCALE in ./ui).
 * All data is made-up sample data from ./sample.
 */

/* 0. Found online: a search result, with the website behind it. */
export function SearchScreen() {
  const s = SEARCH;
  return (
    <div className="relative h-[19em] w-[22em]">
      <UiCard className="absolute top-0 left-0 w-[17em] overflow-hidden">
        <span className="flex items-center gap-[0.35em] border-b border-ink/[0.07] bg-ink/[0.02] px-[0.8em] py-[0.55em]">
          <span className="size-[0.55em] rounded-full bg-ink/15" />
          <span className="size-[0.55em] rounded-full bg-ink/15" />
          <span className="size-[0.55em] rounded-full bg-ink/15" />
          <span className="ml-[0.5em] truncate rounded-full bg-white px-[0.7em] py-[0.15em] text-[0.72em] text-ink/50 ring-1 ring-ink/[0.07]">{s.site.url}</span>
        </span>
        <span className="block bg-linear-to-br from-brand-soft to-white px-[1em] pt-[1.1em] pb-[1em]">
          <span className="block text-[0.72em] font-semibold tracking-wide text-brand uppercase">{s.name}</span>
          <span className="mt-[0.25em] block text-[1.35em] leading-[1.1] font-bold">{s.site.headline}</span>
          <span className="mt-[0.7em] inline-flex rounded-full bg-brand px-[0.9em] py-[0.35em] text-[0.75em] font-semibold text-white">{s.site.cta}</span>
        </span>
        <span className="grid grid-cols-3 gap-[0.5em] p-[0.8em]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="block">
              <span className="block aspect-[4/3] rounded-[0.5em] bg-ink/[0.05]" />
              <span className="mt-[0.35em] block h-[0.4em] w-3/4 rounded-full bg-ink/10" />
            </span>
          ))}
        </span>
      </UiCard>
      <UiCard className="absolute right-0 bottom-0 w-[17.5em] p-[0.85em]">
        <span className="flex items-center gap-[0.5em] rounded-full bg-ink/[0.04] px-[0.8em] py-[0.45em] ring-1 ring-ink/[0.06]">
          <Search className="size-[1em] text-ink/50" strokeWidth={2.4} />
          <span className="text-[0.85em] text-ink/80">{s.query}</span>
        </span>
        <span className="mt-[0.75em] flex items-start gap-[0.6em]">
          <span className="flex size-[2.6em] shrink-0 items-center justify-center rounded-[0.7em] bg-brand-soft text-brand">
            <MapPin className="size-[1.3em]" strokeWidth={2.2} />
          </span>
          <span className="min-w-0">
            <span className="block text-[1em] leading-tight font-bold">{s.name}</span>
            <span className="mt-[0.2em] block text-[0.78em] text-ink/60">
              {s.kind} · <span className="font-semibold text-brand">{s.status}</span> · {s.closes}
            </span>
          </span>
        </span>
        <span className="mt-[0.75em] flex gap-[0.4em]">
          {s.actions.map((a, i) => (
            <span
              key={a}
              className={cx(
                "rounded-full px-[0.75em] py-[0.3em] text-[0.75em] font-semibold",
                i === s.actions.length - 1 ? "bg-brand text-white" : "text-brand ring-1 ring-brand-line",
              )}
            >
              {a}
            </span>
          ))}
        </span>
      </UiCard>
    </div>
  );
}

const KIND_ICON: Record<string, LucideIcon> = { Table: Utensils, Visit: Stethoscope, Viewing: House, Tickets: Ticket };

/* 1. Orders, bookings and tickets, from several kinds of business. */
export function BookingsScreen() {
  const b = BOOKINGS;
  return (
    <UiCard className="w-[19.5em] p-[1em]">
      <span className="flex items-start justify-between">
        <span>
          <span className="block text-[1.15em] leading-tight font-bold">{b.title}</span>
          <span className="block text-[0.78em] text-ink/55">{b.subtitle}</span>
        </span>
        <Pill tone="solid">{b.newLabel}</Pill>
      </span>
      <ul className="mt-[0.8em] divide-y divide-ink/[0.07]">
        {b.items.map((item) => {
          const Icon = KIND_ICON[item.kind] ?? Ticket;
          return (
            <li key={item.who} className="flex items-center gap-[0.65em] py-[0.55em]">
              <span className="flex size-[2.3em] shrink-0 items-center justify-center rounded-[0.65em] bg-brand-soft text-brand">
                <Icon className="size-[1.15em]" strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.85em] leading-tight font-semibold">{item.what}</span>
                <span className="block truncate text-[0.75em] text-ink/55">{item.who}</span>
              </span>
              <span className="text-right">
                <span className="block text-[0.8em] font-semibold">{item.when}</span>
                <span className="inline-flex items-center gap-[0.2em] text-[0.68em] font-semibold text-brand">
                  <Check className="size-[1em]" strokeWidth={3} />
                  {b.status}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </UiCard>
  );
}

/* 2. A lead in the CRM: stage and next follow-up. */
export function LeadScreen() {
  const l = LEAD;
  return (
    <UiCard className="w-[18.5em] p-[1em]">
      <span className="flex items-center gap-[0.65em]">
        <Avatar initials={l.initials} className="text-[1em]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[1.05em] leading-tight font-bold">{l.name}</span>
          <span className="block truncate text-[0.75em] text-ink/55">{l.source}</span>
        </span>
        <Pill>{l.stages[l.stage]}</Pill>
      </span>
      <span className="mt-[0.75em] block rounded-[0.6em] bg-ink/[0.03] px-[0.7em] py-[0.5em] text-[0.8em] text-ink/75 ring-1 ring-ink/[0.05]">{l.interest}</span>
      <span className="mt-[0.85em] grid grid-cols-4 gap-[0.3em]">
        {l.stages.map((stage, i) => (
          <span key={stage}>
            <span className={cx("block h-[0.35em] rounded-full", i <= l.stage ? "bg-brand" : "bg-ink/10")} />
            <span className={cx("mt-[0.35em] block truncate text-[0.66em]", i === l.stage ? "font-bold text-ink" : "text-ink/50")}>{stage}</span>
          </span>
        ))}
      </span>
      <span className="mt-[0.85em] flex items-start gap-[0.6em] rounded-[0.75em] bg-brand-soft px-[0.75em] py-[0.6em]">
        <CalendarClock className="mt-[0.1em] size-[1.2em] shrink-0 text-brand" strokeWidth={2.2} />
        <span className="min-w-0">
          <span className="block text-[0.68em] font-semibold tracking-wide text-brand uppercase">{l.followUpLabel}</span>
          <span className="block text-[0.9em] leading-tight font-bold">{l.followUp}</span>
          <span className="block text-[0.75em] text-ink/65">{l.followUpTask}</span>
        </span>
      </span>
      <span className="mt-[0.7em] flex items-center justify-end gap-[0.4em] text-[0.72em] text-ink/55">
        {l.ownerLabel}
        <Avatar initials={initialsOf(l.owner)} tone="ink" className="text-[0.85em]" />
      </span>
    </UiCard>
  );
}

/* 3. The AI assistant answering on a website. */
export function ChatScreen() {
  const c = CHAT;
  return (
    <UiCard className="w-[17.5em] overflow-hidden">
      <span className="flex items-center gap-[0.55em] border-b border-ink/[0.07] px-[0.9em] py-[0.65em]">
        <span className="flex size-[2.2em] items-center justify-center rounded-full bg-brand text-white">
          <Sparkles className="size-[1.1em]" strokeWidth={2.2} />
        </span>
        <span>
          <span className="block text-[0.9em] leading-tight font-bold">{c.title}</span>
          <span className="flex items-center gap-[0.3em] text-[0.7em] text-ink/55">
            <span className="size-[0.5em] rounded-full bg-brand" />
            {c.status}
          </span>
        </span>
      </span>
      <ol className="flex flex-col gap-[0.45em] px-[0.9em] py-[0.8em] text-[0.8em] leading-snug">
        {c.messages.map((m, i) => (
          <li
            key={i}
            className={
              m.from === "visitor"
                ? "max-w-[82%] self-end rounded-[1.1em] rounded-br-[0.35em] bg-brand px-[0.8em] py-[0.5em] text-white"
                : "max-w-[86%] self-start rounded-[1.1em] rounded-bl-[0.35em] bg-ink/[0.05] px-[0.8em] py-[0.5em] text-ink"
            }
          >
            {m.text}
          </li>
        ))}
      </ol>
      <span className="mx-[0.9em] mb-[0.9em] flex items-center justify-between rounded-full bg-ink/[0.04] py-[0.3em] pr-[0.3em] pl-[0.9em] ring-1 ring-ink/[0.06]">
        <span className="h-[0.45em] w-[6em] rounded-full bg-ink/10" />
        <span className="flex size-[1.9em] items-center justify-center rounded-full bg-brand text-white">
          <Send className="size-[0.95em]" strokeWidth={2.4} />
        </span>
      </span>
    </UiCard>
  );
}

/* 4. A reminder, sent for you, with an older one behind it. */
export function ReminderScreen() {
  const r = REMINDER;
  return (
    <div className="relative w-[18.5em] pt-[2.2em]">
      <UiCard className="absolute inset-x-[1.2em] top-0 flex items-center gap-[0.5em] bg-white/85 px-[0.8em] py-[0.6em] opacity-80 backdrop-blur">
        <span className="flex size-[1.8em] items-center justify-center rounded-[0.5em] bg-ink/[0.07] text-ink/60">
          <Stethoscope className="size-[1em]" strokeWidth={2.2} />
        </span>
        <span className="truncate text-[0.75em] text-ink/70">
          <span className="font-semibold text-ink">{r.behind.app}</span> · {r.behind.title}
        </span>
      </UiCard>
      <UiCard className="relative p-[0.9em]">
        <span className="flex items-center gap-[0.55em]">
          <span className="flex size-[2.3em] items-center justify-center rounded-[0.65em] bg-brand text-white">
            <Ticket className="size-[1.15em]" strokeWidth={2.2} />
          </span>
          <span className="flex-1 text-[0.8em] font-semibold text-ink/60">{r.app}</span>
          <span className="text-[0.72em] text-ink/45">{r.when}</span>
        </span>
        <span className="mt-[0.6em] block text-[1.15em] leading-tight font-bold">{r.title}</span>
        <span className="mt-[0.2em] block text-[0.82em] leading-snug text-ink/65">{r.body}</span>
        <span className="mt-[0.75em] flex items-center gap-[0.7em] rounded-[0.75em] border border-dashed border-brand-line bg-brand-soft/60 px-[0.75em] py-[0.55em]">
          <span className="grid size-[2.6em] shrink-0 grid-cols-4 gap-[0.12em] rounded-[0.3em] bg-white p-[0.25em]">
            {[1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1].map((on, i) => (
              <span key={i} className={on ? "rounded-[0.08em] bg-ink" : undefined} />
            ))}
          </span>
          <span className="text-[0.8em] font-semibold text-brand-strong">{r.ticket}</span>
        </span>
      </UiCard>
    </div>
  );
}

/* 5. A small dashboard: three numbers and a week's chart. */
export function DashboardScreen({ compact = false }: { compact?: boolean }) {
  const d = DASHBOARD;
  const max = Math.max(...d.series);
  const stats = compact ? d.stats.slice(0, 2) : d.stats;
  return (
    <UiCard className={cx("p-[1em]", compact ? "w-[15em]" : "w-[20em]")}>
      <span className="flex items-center justify-between">
        <span className="text-[1.05em] font-bold">{d.title}</span>
        <Pill tone="muted">{d.demo}</Pill>
      </span>
      <span className={cx("mt-[0.75em] grid gap-[0.45em]", compact ? "grid-cols-2" : "grid-cols-3")}>
        {stats.map((s) => (
          <span key={s.label} className="rounded-[0.7em] bg-ink/[0.03] px-[0.6em] py-[0.5em] ring-1 ring-ink/[0.05]">
            <span className="block truncate text-[0.68em] text-ink/55">{s.label}</span>
            <span className="block text-[1.35em] leading-tight font-bold tracking-tight">{s.value}</span>
            <span className="inline-flex items-center text-[0.68em] font-semibold text-brand">
              <ArrowUpRight className="size-[1.1em]" strokeWidth={2.6} />
              {s.delta}
            </span>
          </span>
        ))}
      </span>
      <span className="mt-[0.85em] flex h-[5.5em] items-end gap-[0.45em]">
        {d.series.map((v, i) => (
          <span key={i} className="flex h-full flex-1 flex-col justify-end">
            <span
              className={cx("block rounded-t-[0.35em] rounded-b-[0.15em]", i === d.series.length - 1 ? "bg-brand" : "bg-brand/25")}
              style={{ height: `${(v / max) * 100}%` }}
            />
          </span>
        ))}
      </span>
      <span className="mt-[0.3em] flex gap-[0.45em]">
        {d.days.map((day, i) => (
          <span key={i} className="flex-1 text-center text-[0.62em] text-ink/45">
            {day}
          </span>
        ))}
      </span>
    </UiCard>
  );
}

/* The calm frame: the owner's phone, all caught up. */
export function PhoneScreen() {
  const c = CALM_PHONE;
  return (
    <div className="w-[13.5em] rounded-[2.3em] bg-ink p-[0.45em] shadow-float ring-1 ring-black/20">
      <div className="relative overflow-hidden rounded-[1.9em] bg-canvas px-[0.95em] pt-[0.7em] pb-[1.4em]">
        <span className="absolute top-[0.55em] left-1/2 h-[1.15em] w-[4.2em] -translate-x-1/2 rounded-full bg-ink" />
        <span className="flex items-center justify-between px-[0.4em] text-[0.65em] font-semibold">
          <span>{c.time}</span>
          <span className="flex items-center gap-[0.25em]">
            <span className="h-[0.7em] w-[1em] rounded-[0.2em] bg-ink" />
          </span>
        </span>
        <span className="mt-[1.6em] block text-[0.72em] text-ink/55">{c.greeting}</span>
        <span className="flex items-center gap-[0.35em]">
          <span className="text-[1.15em] leading-tight font-bold">{c.title}</span>
          <CircleCheck className="size-[1.2em] text-brand" strokeWidth={2.4} />
        </span>
        <ul className="mt-[0.8em] space-y-[0.45em]">
          {c.items.map((item) => (
            <li key={item.text} className="flex items-center gap-[0.5em] rounded-[0.8em] bg-white px-[0.6em] py-[0.55em] shadow-float-sm ring-1 ring-ink/[0.05]">
              <span className="flex size-[1.5em] shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Check className="size-[0.9em]" strokeWidth={3} />
              </span>
              <span className="text-[0.74em] leading-tight font-semibold">{item.text}</span>
            </li>
          ))}
        </ul>
        <span className="mx-auto mt-[1.1em] block h-[0.3em] w-[4.5em] rounded-full bg-ink/20" />
      </div>
    </div>
  );
}
