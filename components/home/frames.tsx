import Link from "next/link";
import { FixScene } from "@/components/visuals";
import { CTA, END, FAQ, FIX, HERO, HOW, KIT, PAIN, PRODUCTS, PROOF, WHO } from "@/lib/content";
import { SITE, demoUrl, getVertical } from "@/lib/site";
import { BookButton, ButtonLink, Container, ExternalLink, H2, LEAD, cx } from "@/components/site/ui";
import { ChaosSlot } from "./ChaosStage";
import { KitBuilder } from "./KitBuilder";
import { PainWords } from "./PainWords";
import { FaqList, FoundersNoteCard, IndustryGrid, ProductBlocks } from "./shared";

/** The home page frames, in storyboard order (docs/storyboard.html, section 3). Text renders on the server. */

/* 1. The stress */
export function HeroFrame() {
  return (
    <section aria-labelledby="hero-title">
      <Container className="grid items-center gap-8 pt-10 pb-12 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pt-24 lg:pb-20">
        <div>
          <h1 id="hero-title" className="text-[2.5rem] leading-[1.05] font-bold tracking-tight text-balance sm:text-7xl sm:leading-[1.02]">
            {HERO.title[0]} <span className="text-brand">{HERO.title[1]}</span>
          </h1>
          <p className={cx(LEAD, "mt-6 max-w-xl")}>{HERO.line}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BookButton />
            <ButtonLink href="/demos" variant="secondary">
              {CTA.demos}
            </ButtonLink>
          </div>
        </div>
        <ChaosSlot className="relative mx-auto aspect-[4/3] w-full max-w-xl sm:aspect-square" />
      </Container>
    </section>
  );
}

/* 2. Honest proof */
export function ProofFrame() {
  return (
    <section aria-labelledby="proof-title" className="border-y border-line bg-card/70">
      <Container className="grid gap-8 py-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <h2 id="proof-title" className="text-xl font-bold tracking-tight sm:text-2xl">
            {PROOF.title}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {PROOF.chips.map((chip) => (
              <li key={chip.vertical}>
                <ExternalLink
                  href={demoUrl(getVertical(chip.vertical).liveDemoPath)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-[15px] font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
                >
                  <span aria-hidden className="size-2 rounded-full bg-brand" />
                  {chip.label}
                  <span aria-hidden className="text-muted">
                    ↗
                  </span>
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {PROOF.promises.map((p) => (
            <li key={p} className="flex items-center gap-3 text-base font-semibold text-ink sm:text-lg">
              <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm text-brand">
                ✓
              </span>
              {p}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* 3. The pain, in words */
export function PainFrame() {
  return (
    <section aria-labelledby="pain-title" className="flex min-h-[70svh] items-center">
      <Container className="py-24">
        <div className="max-w-4xl">
          <PainWords id="pain-title" text={PAIN.text} />
        </div>
      </Container>
    </section>
  );
}

/* 4. The fix: six scenes */
export function FixFrame() {
  return (
    <section aria-labelledby="fix-title" className="pb-10">
      <Container className="pt-10 pb-6 sm:pt-16">
        <h2 id="fix-title" className={H2}>
          {FIX.title}
        </h2>
      </Container>
      <ol>
        {FIX.scenes.map((scene, i) => (
          <li key={scene.step}>
            <Container className="grid items-center gap-8 py-12 sm:py-16 lg:min-h-[80svh] lg:grid-cols-2 lg:gap-16">
              <div className={i % 2 ? "lg:order-2" : undefined}>
                <p className="text-lg font-medium text-muted line-through decoration-brand/50 decoration-2 sm:text-xl">{scene.problem}</p>
                <h3 className="mt-4 flex items-start gap-3 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
                  <span aria-hidden className="text-brand">
                    →
                  </span>
                  <span>{scene.service}</span>
                </h3>
                <p className={cx(LEAD, "mt-5 max-w-lg text-ink/80")}>{scene.line}</p>
                <p className="mt-4 text-base text-muted">
                  {FIX.examplesLabel}: {scene.examples}
                </p>
                <Link href={scene.href} className="mt-6 inline-flex items-center gap-1 font-semibold text-brand underline-offset-4 hover:underline">
                  {CTA.learnMore}
                  <span className="sr-only"> about {scene.service}</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
              <FixScene step={scene.step} className="mx-auto aspect-square w-full max-w-[32rem]" />
            </Container>
          </li>
        ))}
      </ol>
      <Container className="flex justify-center pt-4">
        <BookButton />
      </Container>
    </section>
  );
}

/* 6. Who we help */
export function WhoFrame() {
  return (
    <section aria-labelledby="who-title">
      <Container className="py-20 sm:py-28">
        <h2 id="who-title" className={H2}>
          {WHO.title}
        </h2>
        <p className={cx(LEAD, "mt-5 max-w-2xl")}>{WHO.line}</p>
        <div className="mt-12">
          <IndustryGrid />
        </div>
      </Container>
    </section>
  );
}

/* 7. Our products */
export function ProductsFrame() {
  return (
    <section aria-labelledby="products-title" className="bg-canvas-deep">
      <Container className="py-20 sm:py-28">
        <h2 id="products-title" className={H2}>
          {PRODUCTS.title}
        </h2>
        <div className="mt-12">
          <ProductBlocks compact />
        </div>
        <Link href="/products" className="mt-8 inline-flex items-center gap-1 font-semibold text-brand underline-offset-4 hover:underline">
          {CTA.learnMore}
          <span className="sr-only"> about our products</span>
          <span aria-hidden>→</span>
        </Link>
      </Container>
    </section>
  );
}

/* 8. Build your kit */
export function KitFrame() {
  return (
    <section id="kit" aria-labelledby="kit-title">
      <Container className="py-20 sm:py-28">
        <h2 id="kit-title" className={H2}>
          {KIT.title}
        </h2>
        <p className={cx(LEAD, "mt-5 max-w-2xl")}>{KIT.line}</p>
        <div className="mt-12">
          <KitBuilder />
        </div>
      </Container>
    </section>
  );
}

/* 9. How it works */
export function HowFrame() {
  return (
    <section aria-labelledby="how-title" className="bg-card">
      <Container className="py-20 sm:py-28">
        <h2 id="how-title" className={H2}>
          {HOW.title}
        </h2>
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW.steps.map((step, i) => (
            <li key={step.title} className="rounded-3xl border border-line bg-canvas p-6">
              <span aria-hidden className="text-5xl font-bold text-brand">
                {i + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.line}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12">
          <BookButton />
        </div>
      </Container>
    </section>
  );
}

/* 10. A note from the founders */
export function FoundersFrame() {
  return (
    <section aria-label="A note from the founders">
      <Container className="py-20 sm:py-28">
        <FoundersNoteCard />
      </Container>
    </section>
  );
}

/* 11. Questions */
export function FaqFrame() {
  return (
    <section aria-labelledby="faq-title">
      <Container className="pb-20 sm:pb-28">
        <h2 id="faq-title" className={H2}>
          {FAQ.title}
        </h2>
        <div className="mt-10 max-w-4xl">
          <FaqList />
        </div>
      </Container>
    </section>
  );
}

/* 12. The end */
export function EndFrame() {
  return (
    <section aria-labelledby="end-title" className="bg-brand-soft">
      <Container className="flex flex-col items-center py-20 text-center sm:py-28">
        <h2 id="end-title" className={cx(H2, "max-w-3xl")}>
          {END.title}
        </h2>
        <p className={cx(LEAD, "mt-5")}>{END.line}</p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <BookButton />
          <a href={`mailto:${SITE.email}`} className="text-lg font-semibold break-words text-brand hover:text-brand-strong">
            {SITE.email}
          </a>
        </div>
      </Container>
    </section>
  );
}
