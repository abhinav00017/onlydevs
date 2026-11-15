import type { Metadata } from "next";
import { Container, CtaBand, DotList, H2, PageHeader } from "@/components/site/ui";
import { END, META, PRICING_PAGE } from "@/lib/content";

export const metadata: Metadata = {
  title: META.pricing.title,
  description: META.pricing.description,
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHeader eyebrow={PRICING_PAGE.title} title={PRICING_PAGE.heading} intro={PRICING_PAGE.intro} />
      <Container>
        <h2 className={H2}>{PRICING_PAGE.partsTitle}</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2">
          {PRICING_PAGE.parts.map((part, i) => (
            <li key={part.title} className="rounded-3xl border border-line bg-card p-6 sm:p-10">
              <span aria-hidden className="text-5xl font-bold text-brand">
                {i + 1}
              </span>
              <h3 className="mt-4 text-2xl font-bold tracking-tight">{part.title}</h3>
              <p className="mt-3 text-lg text-muted">{part.line}</p>
            </li>
          ))}
        </ol>
      </Container>
      <Container className="grid gap-6 pt-16 sm:pt-24 lg:grid-cols-2">
        <section aria-labelledby="factors" className="rounded-3xl border border-line bg-card p-6 sm:p-10">
          <h2 id="factors" className="text-2xl font-bold tracking-tight sm:text-3xl">
            {PRICING_PAGE.factorsTitle}
          </h2>
          <DotList items={PRICING_PAGE.factors} className="mt-6 text-lg" />
        </section>
        <section aria-labelledby="why" className="rounded-3xl border border-line bg-card p-6 sm:p-10">
          <h2 id="why" className="text-2xl font-bold tracking-tight sm:text-3xl">
            {PRICING_PAGE.whyTitle}
          </h2>
          <p className="mt-6 text-lg text-ink/90">{PRICING_PAGE.why}</p>
        </section>
      </Container>
      <CtaBand title={END.title} />
    </>
  );
}
