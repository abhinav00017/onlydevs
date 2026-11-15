import type { Metadata } from "next";
import { Container, CtaBand, ExternalButton, PageHeader } from "@/components/site/ui";
import { DEMOS_PAGE, END, META } from "@/lib/content";
import { SITE, VERTICALS, demoUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: META.demos.title,
  description: META.demos.description,
  alternates: { canonical: "/demos" },
};

export default function DemosPage() {
  return (
    <>
      <PageHeader eyebrow={DEMOS_PAGE.title} title={DEMOS_PAGE.heading} intro={DEMOS_PAGE.intro} />
      <Container>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((v) => (
            <li key={v.id} className="flex flex-col rounded-3xl border border-line bg-card p-6 sm:p-8">
              <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-brand" />
                {v.name}
              </h2>
              <p className="mt-4 flex-1 text-muted">{DEMOS_PAGE.items[v.id]}</p>
              <ExternalButton href={demoUrl(v.liveDemoPath)} variant="secondary" className="mt-6 w-fit">
                {DEMOS_PAGE.open}
              </ExternalButton>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-start gap-4 rounded-3xl bg-brand-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="text-lg font-semibold">{DEMOS_PAGE.hubLine}</p>
          <ExternalButton href={SITE.demoBaseUrl}>{DEMOS_PAGE.hubButton}</ExternalButton>
        </div>
      </Container>
      <CtaBand title={END.title} />
    </>
  );
}
