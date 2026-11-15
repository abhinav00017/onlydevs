import { BookButton, ButtonLink, Container, H1, LEAD, cx } from "@/components/site/ui";
import { NOT_FOUND } from "@/lib/content";

export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <h1 className={H1}>{NOT_FOUND.heading}</h1>
      <p className={cx(LEAD, "mt-6 max-w-xl")}>{NOT_FOUND.line}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" variant="secondary">
          {NOT_FOUND.home}
        </ButtonLink>
        <BookButton />
      </div>
    </Container>
  );
}
