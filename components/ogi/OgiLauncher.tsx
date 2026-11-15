"use client";

import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { PRODUCTS } from "@/lib/content";
import { OgiMark } from "./OgiMark";

/**
 * Ogi on the company site: plush Ogi on a white circle, bottom right, on every page but /book.
 * Ogi appears only in the chat (this button and the panel), never in the hero or other sections (decisions.md).
 * Per docs/ogi-image-guidelines.html: on a white circle, never on solid purple; 56px button, Ogi at about 40px.
 *
 * The panel's code loads only when the visitor first opens it (or points at the button), so the chat adds almost
 * nothing to a page's first load. Once loaded it stays mounted, so the chat survives closing and page changes.
 */

const loadPanel = () => import("./OgiPanel");
const OgiPanel = dynamic(loadPanel, { ssr: false, loading: () => null });

const COPY = PRODUCTS.ogi.chat;

/**
 * The sticky bottom bar (components/site/BottomBar.tsx) is h-14 (3.5rem) plus a 1px top border plus the safe area.
 * The button sits 1rem above it, so the two never overlap at any width. The panel sits above the button.
 */
export const BUTTON_PLACE = "right-4 bottom-[calc(4.5rem+1px+env(safe-area-inset-bottom))] sm:right-6";

export function OgiLauncher() {
  const pathname = usePathname();
  const onBook = pathname === "/book";
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isOpen = open && !onBook;

  function toggle() {
    setLoaded(true);
    setOpen(!isOpen);
  }

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    // /book is the call form, so Ogi steps aside there. It stays mounted, so the chat is still there on return.
    <div hidden={onBook} data-ogi="">
      <button
        ref={buttonRef}
        type="button"
        data-ogi-button=""
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={loaded ? "ogi-panel" : undefined}
        onClick={toggle}
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        className={`fixed z-30 flex size-14 items-center justify-center rounded-full bg-card text-brand shadow-float ring-1 ring-line transition-transform hover:scale-105 motion-reduce:hover:scale-100 ${BUTTON_PLACE}`}
      >
        {isOpen ? <X aria-hidden strokeWidth={2} className="size-6" /> : <OgiMark size={40} />}
        <span className="sr-only">{isOpen ? COPY.close : COPY.open}</span>
      </button>
      {loaded ? <OgiPanel open={isOpen} onClose={close} /> : null}
    </div>
  );
}
