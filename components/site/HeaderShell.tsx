"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cx } from "./ui";

/** The header's frame: see-through at the very top, so the full-bleed hero runs under it; solid the moment the page scrolls at all. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className={cx(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-150",
        scrolled ? "border-line bg-canvas/95 shadow-[0_1px_12px_rgb(20_39_47/0.06)] backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      {children}
    </header>
  );
}
