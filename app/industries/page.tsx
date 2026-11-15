import type { Metadata } from "next";
import { IndustryGrid } from "@/components/home/shared";
import { Container, CtaBand, PageHeader } from "@/components/site/ui";
import { END, INDUSTRIES_PAGE, META } from "@/lib/content";

export const metadata: Metadata = {
  title: META.industries.title,
  description: META.industries.description,
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHeader eyebrow={INDUSTRIES_PAGE.title} title={INDUSTRIES_PAGE.heading} intro={INDUSTRIES_PAGE.intro} />
      <Container>
        <IndustryGrid headingLevel="h2" />
      </Container>
      <CtaBand title={END.title} />
    </>
  );
}
