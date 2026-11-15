import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { CTA } from "@/lib/content";

/** Shared building blocks. Big type, lots of white space, one purple. */

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export const BUTTON = {
  base: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-colors",
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary: "border border-line bg-card text-ink hover:border-brand-line hover:text-brand-strong",
  small: "min-h-10 px-4 py-2 text-sm",
} as const;

/** Full-bleed side padding for the header, the hero and the bottom bar: small, and growing a little with the screen. */
export const BLEED_X = "px-[clamp(16px,2.5vw,48px)]";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: "primary" | "secondary";
  size?: "default" | "small";
  className?: string;
};

export function ButtonLink({ variant = "primary", size = "default", className, ...props }: ButtonLinkProps) {
  return <Link {...props} className={cx(BUTTON.base, BUTTON[variant], size === "small" && BUTTON.small, className)} />;
}

/** A link to a live demo on the demo hub. It opens in a new tab and says so to screen readers. */
export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function ExternalButton({ href, variant = "primary", className, children }: { href: string; variant?: "primary" | "secondary"; className?: string; children: ReactNode }) {
  return (
    <ExternalLink href={href} className={cx(BUTTON.base, BUTTON[variant], className)}>
      {children}
      <span aria-hidden>↗</span>
    </ExternalLink>
  );
}

export function BookButton({ href = "/book", className, size }: { href?: string; className?: string; size?: "default" | "small" }) {
  return (
    <ButtonLink href={href} size={size} className={className}>
      {CTA.book}
    </ButtonLink>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-brand">
      <span aria-hidden className="size-2 rounded-full bg-brand" />
      {children}
    </p>
  );
}

export const H1 = "text-4xl font-bold tracking-tight text-balance sm:text-6xl";
export const H2 = "text-3xl font-bold tracking-tight text-balance sm:text-5xl";
export const H3 = "text-xl font-bold tracking-tight sm:text-2xl";
export const LEAD = "text-lg text-muted text-pretty sm:text-xl";

/** A purple dot list, the brand motif. */
export function DotList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cx("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden className="mt-2.5 size-2 shrink-0 rounded-full bg-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** The heading block at the top of every inner page. */
export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <Container className="pt-14 pb-10 sm:pt-24 sm:pb-16">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className={cx(H1, "mt-4 max-w-4xl")}>{title}</h1>
      {intro ? <p className={cx(LEAD, "mt-6 max-w-2xl")}>{intro}</p> : null}
    </Container>
  );
}

/** The closing call to action on inner pages. */
export function CtaBand({ title, line, href = "/book" }: { title: string; line?: string; href?: string }) {
  return (
    <Container className="py-16 sm:py-24">
      <div className="rounded-3xl border border-line bg-card px-6 py-12 text-center sm:px-12 sm:py-16">
        <h2 className={cx(H2, "mx-auto max-w-3xl")}>{title}</h2>
        {line ? <p className={cx(LEAD, "mx-auto mt-4 max-w-xl")}>{line}</p> : null}
        <div className="mt-8 flex justify-center">
          <BookButton href={href} />
        </div>
      </div>
    </Container>
  );
}
