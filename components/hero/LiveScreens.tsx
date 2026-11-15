"use client";

import {
  BarChart3,
  CalendarDays,
  Coffee,
  House,
  LayoutGrid,
  Search,
  Settings,
  Stethoscope,
  Ticket,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties } from "react";
import { cx } from "@/components/site/ui";
import { DASHBOARD, HERO_SCREENS, type HeroFeedItem, type HeroScreen } from "@/components/visuals/sample";
import { screenFor, verticalAt, type CycleState, type HeroVerticalId } from "./cycle";

/**
 * Our app, live, on the hero device's screens. Real DOM, drawn in HTML and CSS.
 * Everything is sized in `em`, and the font size follows the screen's width (container query units),
 * so the same screen works on the 3D device, on the flat CSS phone and in tests.
 * All data is made-up sample data (components/visuals/sample.ts), tagged "Sample data" on screen.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const ICON: Record<HeroVerticalId, LucideIcon> = { cafe: Coffee, clinic: Stethoscope, crm: UserRound, events: Ticket };

/** The phone screen is designed at 300 px wide with 13 px type; the laptop at 880 px wide with 13 px type. */
export const PHONE_SCREEN = { width: 300, height: 668 } as const;
export const LAPTOP_SCREEN = { width: 880, height: 550 } as const;
const PHONE_TYPE: CSSProperties = { fontSize: `${(13 / PHONE_SCREEN.width) * 100}cqw` };
const LAPTOP_TYPE: CSSProperties = { fontSize: `${(13 / LAPTOP_SCREEN.width) * 100}cqw` };

type ScreenProps = { state: CycleState; className?: string };

export function PhoneUI({ state, className }: ScreenProps) {
  const id = verticalAt(state.index);
  const screen = screenFor(state.index);
  return (
    <div className={cx("@container h-full w-full overflow-hidden bg-[#f4f7f8] text-ink select-none", className)} data-screen="phone" data-vertical={id}>
      <div style={PHONE_TYPE} className="flex h-full flex-col">
        <div className="flex h-[2.9em] shrink-0 items-center justify-between px-[1.9em] pt-[0.3em] text-[0.9em] font-semibold">
          <span>{HERO_SCREENS.time}</span>
          <span className="flex items-center gap-[0.35em]">
            <span className="flex items-end gap-[0.12em]">
              {[0.45, 0.65, 0.85, 1].map((h) => (
                <span key={h} className="w-[0.22em] rounded-[0.1em] bg-ink" style={{ height: `${h * 0.75}em` }} />
              ))}
            </span>
            <span className="relative h-[0.8em] w-[1.55em] rounded-[0.25em] ring-[0.09em] ring-ink/60">
              <span className="absolute inset-[0.12em] right-[0.4em] rounded-[0.12em] bg-ink" />
            </span>
          </span>
        </div>
        {/* A change of business cross-fades on stacked layers, so the screen is never empty, however fast it changes. */}
        <div className="relative min-h-0 flex-1">
          <AnimatePresence initial={false}>
            <motion.div
              key={id}
              className="absolute inset-0 flex flex-col bg-[#f4f7f8]"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="px-[1.25em] pt-[0.7em]">
                <span className="flex items-center gap-[0.45em] text-[0.8em] font-semibold text-ink/55">
                  <span className="size-[0.6em] rounded-full bg-brand" />
                  {screen.app}
                </span>
                <span className="mt-[0.15em] flex items-center justify-between gap-[0.5em]">
                  <span className="text-[1.75em] leading-tight font-bold tracking-tight">{screen.section}</span>
                  <SampleTag />
                </span>
              </div>
              <CountCard id={id} screen={screen} count={state.count} className="mx-[1.1em] mt-[0.8em]" />
              <span className="mt-[1em] flex items-center gap-[0.45em] px-[1.3em] text-[0.72em] font-semibold tracking-wide text-ink/50 uppercase">
                <span className="relative flex size-[0.6em]">
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand/50 motion-reduce:animate-none" />
                  <span className="relative size-full rounded-full bg-brand" />
                </span>
                {HERO_SCREENS.today}
              </span>
              <Feed id={id} screen={screen} state={state} className="mt-[0.5em] px-[1.1em]" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-auto shrink-0 border-t border-ink/[0.06] bg-white/80 px-[1.6em] pt-[0.7em] pb-[0.5em]">
          <span className="flex items-center justify-between text-ink/40">
            {[House, LayoutGrid, CalendarDays, Settings].map((Icon, i) => (
              <Icon key={i} className={cx("size-[1.35em]", i === 1 && "text-brand")} strokeWidth={2.1} />
            ))}
          </span>
          <span className="mx-auto mt-[0.75em] block h-[0.3em] w-[8em] rounded-full bg-ink/80" />
        </div>
      </div>
    </div>
  );
}

export function LaptopUI({ state, className }: ScreenProps) {
  const id = verticalAt(state.index);
  const screen = screenFor(state.index);
  const NavIcons = [House, ICON[id], Users, CalendarDays, BarChart3];
  return (
    <div className={cx("@container h-full w-full overflow-hidden bg-white text-ink select-none", className)} data-screen="laptop" data-vertical={id}>
      <div style={LAPTOP_TYPE} className="flex h-full flex-col">
        <div className="flex h-[2.6em] shrink-0 items-center gap-[0.5em] border-b border-ink/[0.07] bg-[#eef2f3] px-[1em]">
          <span className="size-[0.75em] rounded-full bg-ink/15" />
          <span className="size-[0.75em] rounded-full bg-ink/15" />
          <span className="size-[0.75em] rounded-full bg-ink/15" />
          <span className="mx-auto flex w-[24em] items-center justify-center gap-[0.4em] rounded-[0.5em] bg-white px-[1em] py-[0.3em] text-[0.8em] text-ink/50 ring-1 ring-ink/[0.06]">
            <Search className="size-[1em]" strokeWidth={2.2} />
            app.example
          </span>
        </div>
        <div className="relative min-h-0 flex-1">
          <AnimatePresence initial={false}>
            <motion.div
              key={id}
              className="absolute inset-0 flex bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="flex w-[14.5em] shrink-0 flex-col gap-[0.25em] border-r border-ink/[0.07] bg-[#f6f8f9] px-[0.9em] py-[1.1em]">
                <span className="mb-[0.9em] flex items-center gap-[0.55em] px-[0.4em]">
                  <span className="flex size-[2em] items-center justify-center rounded-[0.55em] bg-brand text-[0.9em] font-bold text-white">{screen.app[0]}</span>
                  <span className="truncate text-[0.95em] font-bold">{screen.app}</span>
                </span>
                {screen.nav.map((label, i) => {
                  const Icon = NavIcons[i] ?? LayoutGrid;
                  return (
                    <span
                      key={label}
                      className={cx(
                        "flex items-center gap-[0.6em] rounded-[0.6em] px-[0.7em] py-[0.5em] text-[0.88em] font-semibold",
                        i === 1 ? "bg-white text-brand shadow-float-sm ring-1 ring-ink/[0.05]" : "text-ink/55",
                      )}
                    >
                      <Icon className="size-[1.15em]" strokeWidth={2.1} />
                      {label}
                    </span>
                  );
                })}
              </div>
              <div className="flex min-w-0 flex-1 flex-col bg-[#fbfcfc] px-[1.7em] py-[1.3em]">
                <span className="flex items-center justify-between">
                  <span>
                    <span className="block text-[0.78em] font-semibold text-ink/50">{screen.section}</span>
                    <span className="block text-[1.75em] leading-tight font-bold tracking-tight">{HERO_SCREENS.today}</span>
                  </span>
                  <span className="flex items-center gap-[0.6em]">
                    <SampleTag />
                    <span className="flex size-[2.1em] items-center justify-center rounded-full bg-ink/[0.06] text-[0.8em] font-bold text-ink/60">ND</span>
                  </span>
                </span>
                <span className="mt-[1em] grid grid-cols-3 gap-[0.8em]">
                  <CountCard id={id} screen={screen} count={state.count} compact />
                  {screen.tiles.map((t) => (
                    <span key={t.label} className="rounded-[0.9em] bg-white px-[1em] py-[0.8em] ring-1 ring-ink/[0.07]">
                      <span className="block truncate text-[0.75em] font-semibold text-ink/50">{t.label}</span>
                      <span className="mt-[0.2em] block text-[1.6em] leading-tight font-bold tracking-tight">{t.value}</span>
                    </span>
                  ))}
                </span>
                <span className="mt-[0.9em] grid min-h-0 flex-1 grid-cols-[1.55fr_1fr] gap-[0.8em]">
                  <span className="flex min-h-0 flex-col overflow-hidden rounded-[0.9em] bg-white px-[0.9em] py-[0.8em] ring-1 ring-ink/[0.07]">
                    <span className="mb-[0.4em] flex items-center gap-[0.45em] text-[0.72em] font-semibold tracking-wide text-ink/50 uppercase">
                      <span className="size-[0.6em] rounded-full bg-brand" />
                      {screen.section}
                    </span>
                    <Feed id={id} screen={screen} state={state} dense />
                  </span>
                  <WeekChart />
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SampleTag() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-ink/[0.06] px-[0.65em] py-[0.2em] text-[0.7em] font-semibold whitespace-nowrap text-ink/60">
      {HERO_SCREENS.tag}
    </span>
  );
}

function CountCard({ id, screen, count, compact = false, className }: { id: HeroVerticalId; screen: HeroScreen; count: number; compact?: boolean; className?: string }) {
  const Icon = ICON[id];
  const of = screen.count.of;
  return (
    <span className={cx("block rounded-[1.1em] bg-white ring-1 ring-ink/[0.07]", compact ? "rounded-[0.9em] px-[1em] py-[0.8em]" : "px-[1em] py-[0.9em] shadow-float-sm", className)}>
      <span className="flex items-start justify-between gap-[0.5em]">
        <span className="min-w-0">
          <span className="block truncate text-[0.75em] font-semibold text-ink/50">{screen.count.label}</span>
          <span className="relative mt-[0.1em] flex h-[1.25em] items-baseline overflow-hidden text-[1.6em] leading-tight font-bold tracking-tight tabular-nums">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                initial={{ y: "70%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-70%", opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
            {of ? <span className="ml-[0.2em] text-[0.55em] font-semibold text-ink/40">/ {of}</span> : null}
          </span>
        </span>
        {compact ? null : (
          <span className="flex size-[2.4em] shrink-0 items-center justify-center rounded-[0.8em] bg-brand-soft text-brand">
            <Icon className="size-[1.2em]" strokeWidth={2.2} />
          </span>
        )}
      </span>
      {of ? (
        <span className="mt-[0.55em] block h-[0.38em] overflow-hidden rounded-full bg-ink/[0.07]">
          <motion.span
            className="block h-full rounded-full bg-brand"
            initial={false}
            animate={{ width: `${Math.min(100, (count / of) * 100)}%` }}
            transition={{ duration: 0.7, ease: EASE }}
          />
        </span>
      ) : null}
    </span>
  );
}

function Feed({ id, screen, state, dense = false, className }: { id: HeroVerticalId; screen: HeroScreen; state: CycleState; dense?: boolean; className?: string }) {
  const Icon = ICON[id];
  const rows = dense ? state.items.slice(0, 4) : state.items;
  return (
    <ul className={cx("flex flex-col", dense ? "gap-[0.3em]" : "gap-[0.5em]", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {rows.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.55, ease: EASE }}
            className={cx(
              "flex items-center gap-[0.65em] rounded-[0.9em] bg-white ring-1 transition-colors duration-1000",
              dense ? "px-[0.6em] py-[0.45em]" : "px-[0.7em] py-[0.6em] shadow-float-sm",
              item.id === state.latest ? "ring-brand/35" : "ring-ink/[0.06]",
            )}
          >
            <span
              className={cx(
                "flex size-[2.2em] shrink-0 items-center justify-center rounded-[0.65em]",
                item.id === state.latest ? "bg-brand text-white" : "bg-brand-soft text-brand",
              )}
            >
              <Icon className="size-[1.1em]" strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.88em] leading-tight font-semibold">{item.title}</span>
              <span className="block truncate text-[0.75em] text-ink/55">{item.detail}</span>
              {screen.stages && item.stage !== undefined ? <Stages stages={screen.stages} at={item.stage} /> : null}
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-[0.75em] font-semibold text-ink/70">{item.meta}</span>
              <StatusPill item={item} fresh={item.id === state.latest} />
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function StatusPill({ item, fresh }: { item: HeroFeedItem; fresh: boolean }) {
  return (
    <span
      className={cx(
        "mt-[0.2em] inline-flex rounded-full px-[0.55em] py-[0.1em] text-[0.66em] font-semibold whitespace-nowrap",
        fresh ? "bg-brand text-white" : "bg-brand-soft text-brand-strong",
      )}
    >
      {item.status}
    </span>
  );
}

function Stages({ stages, at }: { stages: readonly string[]; at: number }) {
  return (
    <span className="mt-[0.35em] grid grid-cols-4 gap-[0.2em]">
      {stages.map((s, i) => (
        <motion.span
          key={s}
          className="block h-[0.28em] rounded-full"
          initial={false}
          animate={{ backgroundColor: i <= at ? "#6f32d6" : "rgba(20,39,47,0.1)" }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
        />
      ))}
    </span>
  );
}

function WeekChart() {
  const d = DASHBOARD;
  const max = Math.max(...d.series);
  return (
    <span className="flex flex-col rounded-[0.9em] bg-white px-[0.9em] py-[0.8em] ring-1 ring-ink/[0.07]">
      <span className="text-[0.72em] font-semibold tracking-wide text-ink/50 uppercase">{HERO_SCREENS.week}</span>
      <span className="mt-[0.6em] flex min-h-0 flex-1 items-end gap-[0.4em]">
        {d.series.map((v, i) => (
          <span key={i} className="flex h-full flex-1 flex-col justify-end">
            <span
              className={cx("block rounded-t-[0.35em] rounded-b-[0.15em]", i === d.series.length - 1 ? "bg-brand" : "bg-brand/25")}
              style={{ height: `${(v / max) * 100}%` }}
            />
          </span>
        ))}
      </span>
      <span className="mt-[0.3em] flex gap-[0.4em]">
        {d.days.map((day, i) => (
          <span key={i} className="flex-1 text-center text-[0.62em] text-ink/45">
            {day}
          </span>
        ))}
      </span>
    </span>
  );
}
