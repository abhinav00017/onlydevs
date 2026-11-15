import type { Metadata } from "next";
import { Suspense } from "react";
import { BookForm, BookFormFromUrl } from "@/components/book/BookForm";
import { Container, PageHeader } from "@/components/site/ui";
import { BOOK_PAGE, META } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: META.book.title,
  description: META.book.description,
  alternates: { canonical: "/book" },
};

/**
 * The call form. The page is static; the kit in the URL is read in the browser.
 * Until then the same form shows, empty, so text and fields render on the server.
 */
export default function BookPage() {
  return (
    <>
      <PageHeader eyebrow={BOOK_PAGE.title} title={BOOK_PAGE.heading} intro={BOOK_PAGE.intro} />
      <Container className="pb-24">
        <div className="max-w-2xl rounded-3xl border border-line bg-card/60 p-5 sm:p-10">
          <Suspense fallback={<BookForm />}>
            <BookFormFromUrl />
          </Suspense>
        </div>
        <p className="mt-8 text-muted">
          {BOOK_PAGE.emailDirect}{" "}
          <a href={`mailto:${SITE.email}`} className="font-semibold break-words text-brand">
            {SITE.email}
          </a>
        </p>
      </Container>
    </>
  );
}
