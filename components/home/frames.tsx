import Link from "next/link";
import { FixScene } from "@/components/visuals";
import { CTA, END, FAQ, FIX, HERO, HOW, KIT, PAIN, PRODUCTS, PROOF, WHO } from "@/lib/content";
import { SITE, demoUrl, getVertical } from "@/lib/site";
import { BLEED_X, BookButton, ButtonLink, Container, ExternalLink, H2, LEAD, cx } from "@/components/site/ui";
import { HeadlineTurns } from "@/components/hero/HeadlineTurns";
import { HeroPin } from "@/components/hero/HeroPin";
import { HeroStage } from "@/components/hero/HeroStage";
import { KitBuilder } from "./KitBuilder";
import { PainWords } from "./PainWords";
import { FaqList, FoundersNoteCard, IndustryGrid, ProductBlocks } from "./shared";

/** The home page frames, in storyboard order (docs/storyboard.html, section 3). Text renders on the server. */

/*
 * 1. The stress, and the wow: full-bleed, the live device as the stage, the words over it.
 * Desktops and tablets: a pinned scroll scene. The section is tall, the stage is sticky, and scrolling walks the device
 * through the four businesses before the page moves on. Phones and "reduce motion": one normal screen.
 */
export function HeroFrame() {
  return (
    <HeroPin
      className="relative -mt-16 overflow-clip bg-canvas sm:min-h-[680px] sm:motion-safe:h-[360svh] sm:motion-reduce:h-svh"
      stageClassName="relative bg-[radial-gradient(120%_90%_at_72%_60%,#ffffff_0%,#f2f7f8_50%,#e4edef_100%)] sm:sticky sm:top-0 sm:h-svh sm:min-h-[680px] sm:overflow-hidden"
    >
      <div className="relative z-10 sm:pointer-events-none sm:absolute sm:inset-0">
        {/* A soft wash behind the words, so they stay easy to read over the scene. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-linear-to-b from-canvas via-canvas/75 to-transparent to-60% sm:block lg:right-auto lg:w-[52%] lg:bg-linear-to-r lg:from-canvas lg:via-canvas/70 lg:via-60% lg:to-transparent lg:to-100%"
        />
        <div className={cx("relative pt-28 sm:flex sm:h-full sm:pt-32 lg:items-center lg:pt-10", BLEED_X)}>
          <div className="max-w-xl sm:pointer-events-auto lg:max-w-[42vw]">
            <h1
              id="hero-title"
              className="text-[2.5rem] leading-[1.06] font-bold tracking-tight sm:text-6xl sm:leading-[1.04] lg:text-[clamp(3rem,min(4.3vw,8.4svh),9rem)] lg:leading-[1.02]"
            >
              <span className="block text-balance">{HERO.title}</span>
              <HeadlineTurns turns={HERO.turns} className="mt-1 block" />
            </h1>
            <p className={cx(LEAD, "mt-6 max-w-lg text-ink/70 lg:max-w-[min(36rem,34vw)] lg:text-[clamp(1.25rem,1.3vw,1.6rem)]")}>{HERO.line}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BookButton />
              <ButtonLink href="/demos" variant="secondary">
                {CTA.demos}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
      <HeroStage className="relative mt-4 flex h-[30rem] flex-col overflow-hidden sm:absolute sm:inset-0 sm:mt-0 sm:h-auto" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-canvas sm:h-16" />
    </HeroPin>
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

/* 4. The fix: six scenes. Each is a full-bleed photo with our screen over it, and the words over a soft wash beside it. */
export function FixFrame() {
  return (
    <section aria-labelledby="fix-title" className="pb-10">
      <Container className="pt-10 pb-10 sm:pt-16">
        <h2 id="fix-title" className={H2}>
          {FIX.title}
        </h2>
      </Container>
      <ol className="flex flex-col gap-4 lg:gap-0">
        {FIX.scenes.map((scene, i) => {
          const mirrored = i % 2 === 1;
          return (
            <li key={scene.step} className="relative isolate lg:flex lg:min-h-[86svh] lg:items-center">
              <FixScene step={scene.step} className="h-[62svh] min-h-[420px] lg:absolute lg:inset-0 lg:h-auto lg:min-h-0" />
              <div
                aria-hidden
                className={cx(
                  "pointer-events-none absolute inset-0 hidden lg:block",
                  mirrored
                    ? "bg-linear-to-l from-canvas from-25% via-canvas/80 via-45% to-transparent to-70%"
                    : "bg-linear-to-r from-canvas from-25% via-canvas/80 via-45% to-transparent to-70%",
                )}
              />
              <Container className="relative py-10 lg:py-24">
                <div className={cx("max-w-lg", mirrored && "lg:ml-auto")}>
                  <p className="text-lg font-medium text-muted line-through decoration-brand/50 decoration-2 sm:text-xl">{scene.problem}</p>
                  <h3 className="mt-4 flex items-start gap-3 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
                    <span aria-hidden className="text-brand">
                      →
                    </span>
                    <span>{scene.service}</span>
                  </h3>
                  <p className={cx(LEAD, "mt-5 text-ink/80")}>{scene.line}</p>
                  <p className="mt-4 text-base text-muted">
                    {FIX.examplesLabel}: {scene.examples}
                  </p>
                  <Link href={scene.href} className="mt-6 inline-flex items-center gap-1 font-semibold text-brand underline-offset-4 hover:underline">
                    {CTA.learnMore}
                    <span className="sr-only"> about {scene.service}</span>
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </Container>
            </li>
          );
        })}
      </ol>
      <Container className="flex justify-center pt-12">
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
