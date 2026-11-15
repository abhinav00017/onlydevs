"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cx } from "./ui";

/** The header's frame: see-through at the top of the page, so the full-bleed hero runs under it; solid once you scroll. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className={cx(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "border-line/70 bg-canvas/85 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      {children}
    </header>
  );
}
