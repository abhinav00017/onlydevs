import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Container, CtaBand, DotList, ExternalButton, H2, PageHeader } from "@/components/site/ui";
import { DEMOS_PAGE, END, INDUSTRIES, SERVICES, SERVICES_PAGE, serviceBySlug } from "@/lib/content";
import { demoUrl, getVertical } from "@/lib/site";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return {};
  return { title: service.name, description: service.short, alternates: { canonical: `/services/${service.slug}` } };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <PageHeader eyebrow={SERVICES_PAGE.title} title={service.name} intro={service.short} />
      <Container className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="problem" className="rounded-3xl border border-line bg-card p-6 sm:p-10">
          <h2 id="problem" className="text-sm font-semibold tracking-wide text-muted uppercase">
            {SERVICES_PAGE.problemTitle}
          </h2>
          <p className="mt-4 text-2xl font-bold tracking-tight text-balance sm:text-3xl">{service.problem}</p>
        </section>
        <section aria-labelledby="get" className="rounded-3xl border border-line bg-card p-6 sm:p-10">
          <h2 id="get" className="text-sm font-semibold tracking-wide text-muted uppercase">
            {SERVICES_PAGE.getTitle}
          </h2>
          <DotList items={service.whatYouGet} className="mt-5 text-lg" />
        </section>
      </Container>

      <Container className="pt-16 sm:pt-24">
        <h2 className={H2}>{SERVICES_PAGE.forTitle}</h2>
        <ul className="mt-8 flex flex-wrap gap-2">
          {service.forVerticals.map((id) => {
            const v = getVertical(id);
            return (
              <li key={id}>
                <Link
                  href={`/industries/${v.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-5 font-semibold hover:border-brand hover:text-brand"
                >
                  {INDUSTRIES[id].title}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>

      <Container className="pt-16 sm:pt-24">
        <h2 className={H2}>{SERVICES_PAGE.demoTitle}</h2>
        {service.demos.length ? (
          <>
            <p className="mt-4 text-lg text-muted">{SERVICES_PAGE.demoLine}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {service.demos.map((id) => {
                const v = getVertical(id);
                return (
                  <li key={id} className="flex flex-col rounded-3xl border border-line bg-card p-6">
                    <h3 className="text-xl font-bold">{v.name}</h3>
                    <p className="mt-2 flex-1 text-muted">{DEMOS_PAGE.items[id]}</p>
                    <ExternalButton href={demoUrl(v.liveDemoPath)} variant="secondary" className="mt-6 w-fit">
                      {DEMOS_PAGE.open}
                    </ExternalButton>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <>
            <p className="mt-4 text-lg text-muted">{SERVICES_PAGE.noDemoLine}</p>
            <ButtonLink href="/demos" variant="secondary" className="mt-6">
              {DEMOS_PAGE.title}
            </ButtonLink>
          </>
        )}
      </Container>

      <CtaBand title={END.title} />
    </>
  );
}
