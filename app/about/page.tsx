import type { Metadata } from "next";
import { FoundersNoteCard } from "@/components/home/shared";
import { Container, CtaBand, H2, PageHeader } from "@/components/site/ui";
import { ABOUT_PAGE, END, META } from "@/lib/content";

export const metadata: Metadata = {
  title: META.about.title,
  description: META.about.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow={ABOUT_PAGE.title} title={ABOUT_PAGE.heading} intro={ABOUT_PAGE.intro} />
      <Container>
        <FoundersNoteCard />
      </Container>
      <Container className="pt-16 sm:pt-24">
        <h2 className={H2}>{ABOUT_PAGE.promisesTitle}</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {ABOUT_PAGE.promises.map((p) => (
            <li key={p.title} className="rounded-3xl border border-line bg-card p-6 sm:p-8">
              <h3 className="flex items-start gap-3 text-xl font-bold tracking-tight sm:text-2xl">
                <span aria-hidden className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm text-brand">
                  ✓
                </span>
                {p.title}
              </h3>
              <p className="mt-3 text-lg text-muted">{p.line}</p>
            </li>
          ))}
        </ul>
      </Container>
      <CtaBand title={END.title} />
    </>
  );
}
