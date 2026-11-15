"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./ui";

/**
 * The header's frame: see-through at the very top, so the full-bleed hero runs under it; solid the moment the page
 * is scrolled at all. The state is read on mount, on scroll, on pageshow (back/forward cache) and on resize, and a
 * 1 px marker at the top of the page is watched too: a reload that restores the scroll position may fire no scroll event.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 0);
    check();
    // Scroll restoration can land a moment after mount.
    const late = [setTimeout(check, 50), setTimeout(check, 300)];
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("pageshow", check);
    window.addEventListener("resize", check);
    let io: IntersectionObserver | undefined;
    if (marker.current && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(() => check());
      io.observe(marker.current);
    }
    return () => {
      late.forEach(clearTimeout);
      window.removeEventListener("scroll", check);
      window.removeEventListener("pageshow", check);
      window.removeEventListener("resize", check);
      io?.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={marker} aria-hidden className="pointer-events-none absolute top-0 left-0 h-px w-px" />
      <header
        data-scrolled={scrolled ? "true" : "false"}
        className={cx(
          "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-150",
          scrolled ? "border-line bg-canvas/95 shadow-[0_1px_12px_rgb(20_39_47/0.06)] backdrop-blur-md" : "border-transparent bg-transparent",
        )}
      >
        {children}
      </header>
    </>
  );
}
