import Image from "next/image";
import Link from "next/link";
import { FOOTER, NAV } from "@/lib/content";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas-deep pb-20">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Image src="/brand/onlydevs-wordmark.png" alt={SITE.name} width={1256} height={440} className="h-9 w-auto" />
          <p className="mt-4 max-w-xs text-lg font-semibold text-ink">{SITE.tagline}</p>
          <p className="mt-6 text-sm text-muted">{FOOTER.emailLabel}</p>
          <a href={`mailto:${SITE.email}`} className="mt-1 inline-block text-base font-semibold break-words text-brand hover:text-brand-strong">
            {SITE.email}
          </a>
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink/80 hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <ul className="space-y-3">
            {FOOTER.more.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink/80 hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-xs text-sm text-muted">{FOOTER.demoNote}</p>
        </div>
      </div>
    </footer>
  );
}
