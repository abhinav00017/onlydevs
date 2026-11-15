import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Container, CtaBand, DotList, ExternalButton, H2, PageHeader } from "@/components/site/ui";
import { DEMOS_PAGE, END, INDUSTRIES, INDUSTRIES_PAGE, PRODUCTS } from "@/lib/content";
import { SUGGESTED_BLOCKS, kitHref } from "@/lib/kit";
import { VERTICALS, demoUrl, verticalBySlug } from "@/lib/site";

export function generateStaticParams() {
  return VERTICALS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const vertical = verticalBySlug(slug);
  if (!vertical) return {};
  const copy = INDUSTRIES[vertical.id];
  return { title: copy.title, description: copy.intro, alternates: { canonical: `/industries/${vertical.slug}` } };
}

export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const { slug } = await params;
  const vertical = verticalBySlug(slug);
  if (!vertical) notFound();
  const copy = INDUSTRIES[vertical.id];
  const kit = kitHref({ business: vertical.id, blocks: SUGGESTED_BLOCKS[vertical.id] });

  return (
    <>
      <PageHeader eyebrow={INDUSTRIES_PAGE.title} title={copy.title} intro={copy.intro} />

      <Container className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section aria-labelledby="day" className="rounded-3xl border border-line bg-card p-6 sm:p-10">
          <h2 id="day" className="text-2xl font-bold tracking-tight sm:text-3xl">
            {INDUSTRIES_PAGE.dayTitle}
          </h2>
          <DotList items={copy.usualDay} className="mt-6 text-lg text-ink/90" />
        </section>
        <section aria-labelledby="build" className="rounded-3xl border border-line bg-card p-6 sm:p-10">
          <h2 id="build" className="text-2xl font-bold tracking-tight sm:text-3xl">
            {INDUSTRIES_PAGE.buildTitle}
          </h2>
          <ul className="mt-6 divide-y divide-line">
            {copy.weBuild.map((item) => (
              <li key={item.title}>
                <Link href={item.href} className="group flex items-start justify-between gap-4 py-4">
                  <span>
                    <span className="block text-lg font-semibold text-ink group-hover:text-brand">{item.title}</span>
                    <span className="mt-1 block text-muted">{item.line}</span>
                  </span>
                  <span aria-hidden className="mt-1 text-brand">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <Container className="pt-16 sm:pt-24">
        <h2 className={H2}>{INDUSTRIES_PAGE.demoTitle}</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          {DEMOS_PAGE.items[vertical.id]} {INDUSTRIES_PAGE.demoLine}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ExternalButton href={demoUrl(vertical.liveDemoPath)}>{DEMOS_PAGE.open}</ExternalButton>
          <ButtonLink href={kit} variant="secondary">
            {INDUSTRIES_PAGE.kitLabel}
          </ButtonLink>
        </div>
        {vertical.id === "events" ? <p className="mt-4 text-sm text-muted">{PRODUCTS.ticketing.demoNote}</p> : null}
      </Container>

      <CtaBand title={END.title} href={kit} />
    </>
  );
}
