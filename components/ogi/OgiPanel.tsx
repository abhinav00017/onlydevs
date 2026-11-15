"use client";

import { ArrowRight, Mail, MessageCircle, SendHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { CTA, PRODUCTS } from "@/lib/content";
import { SITE } from "@/lib/site";

/**
 * The Ogi chat panel. Loaded only when the visitor first opens the chat (components/ogi/OgiLauncher.tsx).
 * The panel only names its page ("onlydevs"); the server decides the facts, the role and the tools.
 * With no model key the panel shows "Ogi is resting" and the email.
 */

export const OGI_PAGE = "onlydevs";

type BookCard = { href: string; label: string; kind: string; blocks: string[] };
type Msg = { from: "visitor" | "ogi"; text: string; book?: BookCard };
type Status = "checking" | "awake" | "resting";

const COPY = PRODUCTS.ogi.chat;
const MAX_CHARS = 800;
/** The server caps a request at 20 messages; send the latest 19 plus the new one. */
const HISTORY = 19;

/** Only a link to the call form may become a button. Anything else from the server is dropped. */
function safeBook(card: BookCard | undefined): BookCard | undefined {
  if (!card || typeof card.href !== "string") return undefined;
  return card.href === "/book" || card.href.startsWith("/book?") ? card : undefined;
}

export default function OgiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<Status>("checking");
  const [greeting, setGreeting] = useState<string>(COPY.greeting);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Ask once, when the panel first loads, whether Ogi is awake.
  useEffect(() => {
    let live = true;
    fetch(`/api/ogi/chat?page=${OGI_PAGE}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { ok?: boolean; awake?: boolean; greeting?: string }) => {
        if (!live) return;
        if (d.greeting) setGreeting(d.greeting);
        setStatus(d.ok && d.awake ? "awake" : "resting");
      })
      .catch(() => live && setStatus("resting"));
    return () => {
      live = false;
    };
  }, []);

  // Opening moves focus into the panel: the message box when Ogi is awake, else the close button.
  useEffect(() => {
    if (!open) return;
    if (status === "awake") inputRef.current?.focus();
    else closeRef.current?.focus();
  }, [open, status]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, busy]);

  function onPanelKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim().slice(0, MAX_CHARS);
    if (!text || busy) return;
    const next: Msg[] = [...messages, { from: "visitor", text }];
    setMessages(next);
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/ogi/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: OGI_PAGE,
          messages: next.slice(-HISTORY - 1).map((m) => ({ role: m.from === "visitor" ? "user" : "assistant", content: m.text })),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; reply?: string; book?: BookCard; resting?: boolean; error?: string };
      if (data.resting) {
        setStatus("resting");
      } else if (data.ok && data.reply) {
        setMessages((ms) => [...ms, { from: "ogi", text: data.reply!, book: safeBook(data.book) }]);
      } else {
        setMessages((ms) => [...ms, { from: "ogi", text: data.error ?? `${COPY.error} ${SITE.email}.` }]);
      }
    } catch {
      setMessages((ms) => [...ms, { from: "ogi", text: `${COPY.error} ${SITE.email}.` }]);
    } finally {
      setBusy(false);
    }
  }

  function onInputKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div
      id="ogi-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      hidden={!open}
      data-ogi-panel=""
      onKeyDown={onPanelKey}
      className="fixed inset-x-3 bottom-[calc(8.75rem+1px+env(safe-area-inset-bottom))] z-50 flex h-[min(36rem,calc(100dvh-10rem-env(safe-area-inset-bottom)))] flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-float sm:inset-x-auto sm:right-6 sm:w-[24rem]"
    >
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <MessageCircle strokeWidth={2} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-base font-bold text-ink">
            {COPY.title}
          </h2>
          <p className="truncate text-sm text-muted">{COPY.subtitle}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <X aria-hidden strokeWidth={2} className="size-5" />
          <span className="sr-only">{COPY.close}</span>
        </button>
      </header>

      {status === "resting" ? (
        <Resting />
      ) : (
        <>
          <div ref={listRef} aria-live="polite" aria-busy={busy || status === "checking"} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" data-ogi-log="">
            {status === "checking" ? <p className="text-sm text-muted">{COPY.waking}</p> : <OgiLine text={greeting} />}
            {messages.map((msg, i) =>
              msg.from === "visitor" ? (
                <p key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-[15px] leading-snug whitespace-pre-wrap text-white">
                  <span className="sr-only">You: </span>
                  {msg.text}
                </p>
              ) : (
                <div key={i} className="space-y-2">
                  <OgiLine text={msg.text} />
                  {msg.book ? <BookButton card={msg.book} /> : null}
                </div>
              ),
            )}
            {busy ? <p className="text-sm text-muted">{COPY.typing}</p> : null}
          </div>

          <form onSubmit={send} className="border-t border-line px-3 pt-3">
            <div className="flex items-end gap-2">
              <label htmlFor={`${titleId}-input`} className="sr-only">
                {COPY.inputLabel}
              </label>
              <textarea
                id={`${titleId}-input`}
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={MAX_CHARS}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onInputKey}
                disabled={status !== "awake"}
                placeholder={COPY.placeholder}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-card px-3.5 py-2.5 text-base text-ink placeholder:text-muted focus:border-brand focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !draft.trim() || status !== "awake"}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-strong disabled:opacity-50"
              >
                <SendHorizontal aria-hidden strokeWidth={2} className="size-5" />
                <span className="sr-only">{COPY.send}</span>
              </button>
            </div>
          </form>
        </>
      )}
      <p data-ogi-disclaimer="" className="px-4 pt-2 pb-3 text-xs text-muted">
        {COPY.disclaimer}
      </p>
    </div>
  );
}

/** Site pages and the two allowed origins become links. Everything else stays text. */
const LINKABLE = /(https:\/\/[^\s<>"')]+|(?<=^|[\s(])\/(?:services|products|industries|demos|pricing|about|book)(?:[/#?][^\s<>"')]*)?)/g;
const ORIGINS = [new URL(SITE.url).origin, new URL(SITE.demoBaseUrl).origin];

function linkify(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINKABLE)) {
    const raw = m[0].replace(/[.,;:!?]+$/, "");
    const start = m.index ?? 0;
    let node: ReactNode = null;
    if (raw.startsWith("/")) {
      node = (
        <Link key={start} href={raw} className="font-semibold text-brand underline underline-offset-2">
          {raw}
        </Link>
      );
    } else {
      let origin = "";
      try {
        origin = new URL(raw).origin;
      } catch {
        /* not a link */
      }
      if (ORIGINS.includes(origin)) {
        node = (
          <a key={start} href={raw} target="_blank" rel="noopener noreferrer" className="font-semibold break-all text-brand underline underline-offset-2">
            {raw}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
      }
    }
    if (!node) continue;
    out.push(text.slice(last, start), node);
    last = start + raw.length;
  }
  out.push(text.slice(last));
  return out;
}

function OgiLine({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-canvas px-3.5 py-2.5 text-[15px] leading-snug whitespace-pre-wrap text-ink">
      <span className="sr-only">Ogi: </span>
      {linkify(text)}
    </p>
  );
}

function BookButton({ card }: { card: BookCard }) {
  return (
    <div data-ogi-book="" className="rounded-2xl border border-line bg-card p-3">
      {card.blocks.length ? (
        <p className="mb-2 text-sm text-muted">
          {card.kind}: {card.blocks.join(", ")}
        </p>
      ) : null}
      <Link
        href={card.href}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-strong"
      >
        {CTA.book}
        <ArrowRight aria-hidden strokeWidth={2} className="size-4" />
      </Link>
    </div>
  );
}

function Resting() {
  return (
    <div data-ogi-resting="" className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      <span aria-hidden className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <MessageCircle strokeWidth={2} className="size-7" />
      </span>
      <p className="text-lg font-bold text-ink">{COPY.restingTitle}</p>
      <p className="max-w-xs text-sm text-muted">{COPY.restingLine}</p>
      <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
        <a
          href={`mailto:${SITE.email}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-card px-4 py-2.5 text-sm font-semibold break-all text-ink transition-colors hover:border-brand-line hover:text-brand-strong"
        >
          <Mail aria-hidden strokeWidth={2} className="size-4 shrink-0 text-brand" />
          {SITE.email}
        </a>
        <Link
          href="/book"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          {CTA.book}
        </Link>
      </div>
    </div>
  );
}
