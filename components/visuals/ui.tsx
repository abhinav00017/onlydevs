import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/site/ui";

/**
 * Building blocks for the floating product screens. Everything inside a scene is sized in `em`,
 * and the scene's font size follows the width of its box (container query units), so the
 * whole screen scales down on a phone instead of overflowing it.
 */

/** Put on the layer inside an `@container` box. 2.6% of the box width, kept between 8 and 13 px. */
export const SCALE: CSSProperties = { fontSize: "clamp(8px, 2.6cqw, 13px)" };

/** A white card: crisp hairline border, soft layered shadow, rounded corners. */
export function UiCard({ className, children, style }: { className?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={cx("rounded-[1.1em] bg-white text-ink ring-1 ring-ink/[0.07] shadow-float", className)} style={style}>
      {children}
    </div>
  );
}

export function Avatar({ initials, tone = "brand", className }: { initials: string; tone?: "brand" | "ink"; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex size-[2.4em] shrink-0 items-center justify-center rounded-full text-[0.85em] font-bold",
        tone === "brand" ? "bg-brand-soft text-brand" : "bg-ink/[0.06] text-ink/70",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function Pill({ children, tone = "brand", className }: { children: ReactNode; tone?: "brand" | "solid" | "muted"; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-[0.3em] rounded-full px-[0.65em] py-[0.2em] text-[0.8em] leading-[1.3] font-semibold whitespace-nowrap",
        tone === "brand" && "bg-brand-soft text-brand-strong",
        tone === "solid" && "bg-brand text-white",
        tone === "muted" && "bg-ink/[0.06] text-ink/70",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** "MO" from "Mateo Rossi". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
