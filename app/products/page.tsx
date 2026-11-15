import type { Metadata } from "next";
import { ProductBlocks } from "@/components/home/shared";
import { Container, CtaBand, PageHeader } from "@/components/site/ui";
import { END, META, PRODUCTS } from "@/lib/content";

export const metadata: Metadata = {
  title: META.products.title,
  description: META.products.description,
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader eyebrow={META.products.title} title={PRODUCTS.pageHeading} intro={PRODUCTS.pageIntro} />
      <Container>
        <ProductBlocks headingLevel="h2" />
      </Container>
      <CtaBand title={END.title} />
    </>
  );
}
