import Image from "next/image";
import Link from "next/link";
import { CTA, NAV } from "@/lib/content";
import { SITE } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { BookButton } from "./ui";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0 rounded-md" aria-label={`${SITE.name} home`}>
          <Image src="/brand/onlydevs-wordmark.png" alt={SITE.name} width={1256} height={440} priority className="h-8 w-auto sm:h-9" />
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-full px-3 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <BookButton size="small" className="whitespace-nowrap" />
          <MobileMenu items={NAV} bookLabel={CTA.book} />
        </div>
      </div>
    </header>
  );
}
