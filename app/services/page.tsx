import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, Container, PageHeader } from "@/components/site/ui";
import { CTA, END, META, SERVICES, SERVICES_PAGE } from "@/lib/content";

export const metadata: Metadata = {
  title: META.services.title,
  description: META.services.description,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader eyebrow={SERVICES_PAGE.title} title={SERVICES_PAGE.heading} intro={SERVICES_PAGE.intro} />
      <Container>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-line bg-card p-6 transition-colors hover:border-brand-line sm:p-8"
              >
                <h2 className="text-2xl font-bold tracking-tight">{s.name}</h2>
                <p className="mt-3 flex-1 text-muted">{s.short}</p>
                <span className="mt-6 inline-flex items-center gap-1 font-semibold text-brand">
                  {CTA.learnMore} <span aria-hidden>→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
      <CtaBand title={END.title} />
    </>
  );
}
