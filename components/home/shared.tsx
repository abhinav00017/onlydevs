import Link from "next/link";
import { CTA, FAQ, FOUNDERS_NOTE, INDUSTRIES, PRODUCTS, WHO } from "@/lib/content";
import { SUGGESTED_BLOCKS, kitHref } from "@/lib/kit";
import { PRODUCT_DEMOS, VERTICALS, demoUrl, type Vertical } from "@/lib/site";
import { DotList, ExternalButton, ExternalLink, H3, cx } from "@/components/site/ui";

/** Pieces used on the home page and on inner pages. */

export function FoundersNoteCard({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  return (
    <figure className="mx-auto max-w-3xl rounded-3xl border border-line bg-card px-6 py-10 sm:px-12 sm:py-14">
      <Heading className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">{FOUNDERS_NOTE.title}</Heading>
      <blockquote className="mt-8 space-y-5 text-lg leading-relaxed text-ink/90 sm:text-xl">
        {FOUNDERS_NOTE.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-2 text-base font-semibold text-ink">
        <span aria-hidden className="size-2 rounded-full bg-brand" />
        {FOUNDERS_NOTE.signature}
      </figcaption>
    </figure>
  );
}

export function FaqList() {
  return (
    <div className="divide-y divide-line rounded-3xl border border-line bg-card">
      {FAQ.items.map((item) => (
        <details key={item.q} className="group px-5 sm:px-8">
          <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-lg font-semibold text-ink sm:text-xl">
            <h3>{item.q}</h3>
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-brand transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="pb-6 text-base leading-relaxed text-muted sm:text-lg">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** One card per vertical, all the same size. */
export function IndustryCard({ vertical, headingLevel = "h3" }: { vertical: Vertical; headingLevel?: "h2" | "h3" }) {
  const copy = INDUSTRIES[vertical.id];
  const Heading = headingLevel;
  return (
    <article className="flex h-full flex-col rounded-3xl border border-line bg-card p-6 transition-transform duration-300 ease-out [transform-style:preserve-3d] hover:[transform:perspective(900px)_rotateX(3deg)_rotateY(-4deg)_translateY(-2px)] motion-reduce:hover:transform-none sm:p-7">
      <Heading className={H3}>{vertical.name}</Heading>
      <DotList items={copy.things} className="mt-6 flex-1 text-base text-ink/90" />
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <ExternalLink href={demoUrl(vertical.liveDemoPath)} className="inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-strong">
          {CTA.seeLive} <span aria-hidden>↗</span>
        </ExternalLink>
        <Link href={`/industries/${vertical.slug}`} className="font-semibold text-ink/80 underline-offset-4 hover:text-brand hover:underline">
          {CTA.learnMore}
          <span className="sr-only"> about {copy.title}</span>
        </Link>
      </div>
    </article>
  );
}

export function SomethingElseCard({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="flex h-full flex-col rounded-3xl border border-dashed border-brand-line bg-brand-soft/60 p-6 sm:p-7">
      <Heading className={H3}>{WHO.other.title}</Heading>
      <p className="mt-6 flex-1 text-base text-ink/90">{WHO.other.line}</p>
      <Link
        href={kitHref({ business: "other", blocks: SUGGESTED_BLOCKS.other })}
        className="mt-8 inline-flex min-h-11 w-fit items-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong"
      >
        {CTA.book}
      </Link>
    </article>
  );
}

export function IndustryGrid({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {VERTICALS.map((v) => (
        <li key={v.id}>
          <IndustryCard vertical={v} headingLevel={headingLevel} />
        </li>
      ))}
      <li>
        <SomethingElseCard headingLevel={headingLevel} />
      </li>
    </ul>
  );
}

function FeatureGrid({ features, limit }: { features: readonly { title: string; line: string }[]; limit?: number }) {
  const shown = limit ? features.slice(0, limit) : features;
  return (
    <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {shown.map((f) => (
        <li key={f.title} className="flex gap-3">
          <span aria-hidden className="mt-2.5 size-2 shrink-0 rounded-full bg-brand" />
          <span>
            <span className="block font-semibold text-ink">{f.title}</span>
            <span className="mt-1 block text-muted">{f.line}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Our two products, each with its own section and its own demo button. */
export function ProductBlocks({ compact = false, headingLevel = "h3" }: { compact?: boolean; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const t = PRODUCTS.ticketing;
  const o = PRODUCTS.ogi;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section id={compact ? undefined : t.id} aria-labelledby={`product-${t.id}`} className="flex flex-col rounded-3xl border border-line bg-card p-6 sm:p-10">
        <TicketArt />
        <Heading id={`product-${t.id}`} className={cx(H3, "mt-8 text-2xl sm:text-3xl")}>
          {t.name}
        </Heading>
        <p className="mt-3 text-lg text-muted">{t.line}</p>
        {compact ? null : (
          <p className="mt-6 text-base">
            <span className="font-semibold">{PRODUCTS.forTitle}: </span>
            {t.forWho}
          </p>
        )}
        <div className="mt-8 flex-1">
          {compact ? null : <p className="mb-5 text-sm font-semibold tracking-wide text-muted uppercase">{PRODUCTS.featuresTitle}</p>}
          <FeatureGrid features={t.features} limit={compact ? 4 : undefined} />
        </div>
        <div className="mt-10">
          <ExternalButton href={demoUrl(PRODUCT_DEMOS.ticketing)}>{t.button}</ExternalButton>
          <p className="mt-3 text-sm text-muted">{t.demoNote}</p>
        </div>
      </section>

      <section id={compact ? undefined : o.id} aria-labelledby={`product-${o.id}`} className="flex flex-col rounded-3xl border border-line bg-card p-6 sm:p-10">
        <ChatPreview />
        <Heading id={`product-${o.id}`} className={cx(H3, "mt-8 text-2xl sm:text-3xl")}>
          {o.name}
        </Heading>
        <p className="mt-3 text-lg text-muted">{o.line}</p>
        {compact ? null : (
          <p className="mt-6 text-base">
            <span className="font-semibold">{PRODUCTS.forTitle}: </span>
            {o.forWho}
          </p>
        )}
        <div className="mt-8 flex-1">
          {compact ? null : <p className="mb-5 text-sm font-semibold tracking-wide text-muted uppercase">{PRODUCTS.featuresTitle}</p>}
          <FeatureGrid features={o.features} limit={compact ? 4 : undefined} />
        </div>
        <div className="mt-10">
          <ExternalButton href={demoUrl(PRODUCT_DEMOS.ogi)}>{o.button}</ExternalButton>
          <p className="mt-3 text-sm text-muted">{o.demoNote}</p>
        </div>
      </section>
    </div>
  );
}

/** Ogi shown as a product: a mock conversation, not the mascot. */
function ChatPreview() {
  const o = PRODUCTS.ogi;
  return (
    <figure className="flex min-h-56 w-full flex-col rounded-2xl bg-brand-soft p-4 sm:aspect-[16/9] sm:p-5">
      <figcaption className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-card text-brand">
          <ChatIcon />
        </span>
        {o.name}
        <span className="sr-only">: {o.previewLabel}</span>
      </figcaption>
      <ol className="mt-3 flex flex-1 flex-col justify-end gap-2 text-sm leading-snug">
        {o.preview.map((m, i) => (
          <li
            key={i}
            className={
              m.from === "visitor"
                ? "max-w-[80%] self-end rounded-2xl rounded-br-md bg-brand px-3 py-2 text-white"
                : "max-w-[85%] self-start rounded-2xl rounded-bl-md bg-card px-3 py-2 text-ink"
            }
          >
            <span className="sr-only">{m.from === "visitor" ? "Visitor: " : `${o.name}: `}</span>
            {m.text}
          </li>
        ))}
      </ol>
    </figure>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </svg>
  );
}

/** A plain drawn ticket, so the ticketing card has a picture without a canvas. */
function TicketArt() {
  return (
    <div aria-hidden className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl bg-brand-soft">
      <div className="relative flex h-24 w-64 max-w-[80%] -rotate-3 items-stretch rounded-2xl bg-card shadow-sm ring-1 ring-brand-line sm:h-28">
        <div className="flex flex-1 flex-col justify-center gap-2 px-5">
          <span className="h-2.5 w-24 rounded-full bg-brand/80" />
          <span className="h-2 w-32 max-w-full rounded-full bg-line" />
          <span className="h-2 w-16 rounded-full bg-line" />
        </div>
        <div className="my-3 border-l-2 border-dashed border-brand-line" />
        <div className="flex w-16 items-center justify-center">
          <span className="size-6 rounded-full bg-brand" />
        </div>
      </div>
    </div>
  );
}

