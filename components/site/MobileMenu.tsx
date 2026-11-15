"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

/** The phone menu: a button that opens the same links as the desktop nav. Escape closes it. */
export function MobileMenu({ items, bookLabel }: { items: readonly { href: string; label: string }[]; bookLabel: string }) {
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Open only on the page it was opened on, so it closes after navigating.
  const isOpen = openedAt !== null && openedAt === pathname;
  const close = () => setOpenedAt(null);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenedAt(null);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const linkClass = "block rounded-xl px-2 py-3 text-lg font-semibold text-ink";

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpenedAt(isOpen ? null : pathname)}
        className="flex size-10 items-center justify-center rounded-full border border-line bg-card text-ink"
      >
        <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
        <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {isOpen ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
        </svg>
      </button>
      <nav id={panelId} aria-label="Main menu" hidden={!isOpen} className="absolute inset-x-0 top-full border-b border-line bg-canvas px-4 pt-2 pb-6 shadow-sm">
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={close} className={linkClass}>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/pricing" onClick={close} className={linkClass}>
              Pricing
            </Link>
          </li>
          <li className="pt-3">
            <Link
              href="/book"
              onClick={close}
              className="flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-base font-semibold text-white"
            >
              {bookLabel}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
