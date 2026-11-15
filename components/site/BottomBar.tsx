"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_BAR, CTA } from "@/lib/content";
import { BLEED_X, cx } from "./ui";

/** The slim bar that stays at the bottom of every page. Hidden on /book, where the form is the action. */
export function BottomBar() {
  const pathname = usePathname();
  if (pathname === "/book") return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className={cx("flex h-14 w-full items-center justify-between gap-3", BLEED_X)}>
        <p className="truncate text-sm font-medium text-muted">{BOTTOM_BAR.line}</p>
        <Link
          href="/book"
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          {CTA.book}
        </Link>
      </div>
    </div>
  );
}
