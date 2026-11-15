"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { BOOK_PAGE, KIT, blockName } from "@/lib/content";
import { bookingMailto, validateBooking, type FieldErrors } from "@/lib/book";
import { BLOCK_IDS, businessSchema, kitFromSearchParams, sortBlocks, type BlockId, type BusinessId, type Kit } from "@/lib/kit";
import { UTM_KEYS, type RequestSource, type Utm } from "@/lib/requests/types";

const F = BOOK_PAGE.fields;
const FIELD =
  "mt-2 block w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-ink placeholder:text-muted/70 focus-visible:border-brand aria-invalid:border-red-600";
const LABEL = "block text-base font-semibold text-ink";
const ERROR = "mt-2 text-sm font-medium text-red-700";
const ORDER = ["name", "business", "contact", "time"] as const;
const PRIMARY =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-strong";

/** Where the visitor came from: Ogi's link (source=ogi) and any UTM tags. Saved with the request. */
export type Origin = { source: RequestSource; utm?: Utm };

/** Reads the kit from the URL (/book?business=cafe&kit=website,orders) and prefills the form. */
export function BookFormFromUrl() {
  const params = useSearchParams();
  const kit = kitFromSearchParams(params);
  return <BookForm key={params.toString()} initial={kit} origin={originFromSearchParams(params)} />;
}

export function originFromSearchParams(params: Pick<URLSearchParams, "get">): Origin {
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim().slice(0, 100);
    if (value) utm[key] = value;
  }
  return { source: params.get("source") === "ogi" ? "ogi" : "form", ...(Object.keys(utm).length ? { utm } : {}) };
}

type Sending = { kind: "idle" } | { kind: "sending" } | { kind: "saved"; ref: string } | { kind: "failed"; mailto: string };

/**
 * The "Book a free call" form. Validates in the browser, then saves the request (POST /api/book) and shows its
 * reference. If saving fails for any reason other than a field error, it offers "Email us instead" with the
 * request written out, so a lead is never lost.
 */
export function BookForm({ initial, origin = { source: "form" } }: { initial?: Kit; origin?: Origin }) {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState<string>(initial?.business ?? "");
  const [contact, setContact] = useState("");
  const [kit, setKit] = useState<BlockId[]>(initial?.blocks ?? []);
  const [time, setTime] = useState<string>(BOOK_PAGE.times[0]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState<Sending>({ kind: "idle" });
  const honeypotRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const businessId = businessSchema.safeParse(business).success ? (business as BusinessId) : undefined;

  function toggleBlock(id: BlockId) {
    setKit((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : sortBlocks([...prev, id])));
  }

  function showErrors(next: FieldErrors) {
    setErrors(next);
    setSending({ kind: "idle" });
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending.kind === "sending") return;
    const result = validateBooking({ name, business, contact, kit, time });
    if (!result.ok) return showErrors(result.errors);
    setErrors({});
    setSending({ kind: "sending" });

    const body = { name, business, contact, kit, time, ...origin, company_url: honeypotRef.current?.value ?? "" };
    let next: Sending = { kind: "failed", mailto: bookingMailto(result.data) };
    try {
      const res = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; ref?: unknown; errors?: FieldErrors };
      if (res.ok && data.ok && typeof data.ref === "string") next = { kind: "saved", ref: data.ref };
      else if (res.status === 400 && data.errors && Object.keys(data.errors).length) return showErrors(data.errors);
    } catch {
      // Offline, or the server did not answer: the email fallback below.
    }
    setSending(next);
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  if (sending.kind === "saved") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="scroll-mt-24 rounded-2xl border border-brand-line bg-brand-soft p-6 sm:p-8">
        <p className="text-2xl font-bold tracking-tight text-ink">{BOOK_PAGE.savedTitle}</p>
        <p className="mt-2 text-lg text-ink/80">{BOOK_PAGE.savedLine}</p>
        <p className="mt-6 text-sm font-semibold text-muted">{BOOK_PAGE.refLabel}</p>
        <p data-ref="" className="mt-1 font-mono text-2xl font-semibold tracking-wider text-brand">
          {sending.ref}
        </p>
      </div>
    );
  }

  const busy = sending.kind === "sending";
  const errorList = ORDER.filter((k) => errors[k]);
  const describedBy = (key: keyof FieldErrors, hint?: boolean) =>
    [hint ? `${key}-hint` : "", errors[key] ? `${key}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <form noValidate onSubmit={onSubmit} className="relative space-y-8" aria-label={BOOK_PAGE.title} aria-busy={busy || undefined}>
      {errorList.length ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-semibold">{BOOK_PAGE.errorsTitle}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errorList.map((key) => (
              <li key={key}>
                <a href={`#book-${key}`} className="underline underline-offset-2">
                  {errors[key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <label htmlFor="book-name" className={LABEL}>
          {F.name.label}
        </label>
        <input
          id="book-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          className={FIELD}
        />
        {errors.name ? (
          <p id="name-error" className={ERROR}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="book-business" className={LABEL}>
          {F.business.label}
        </label>
        <select
          id="book-business"
          name="business"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          aria-invalid={errors.business ? true : undefined}
          aria-describedby={describedBy("business")}
          className={FIELD}
        >
          <option value="">{F.business.placeholder}</option>
          {KIT.businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
        {errors.business ? (
          <p id="business-error" className={ERROR}>
            {errors.business}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="book-contact" className={LABEL}>
          {F.contact.label}
        </label>
        <p id="contact-hint" className="mt-1 text-sm text-muted">
          {F.contact.hint}
        </p>
        <input
          id="book-contact"
          name="contact"
          type="text"
          autoComplete="email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          aria-invalid={errors.contact ? true : undefined}
          aria-describedby={describedBy("contact", true)}
          className={FIELD}
        />
        {errors.contact ? (
          <p id="contact-error" className={ERROR}>
            {errors.contact}
          </p>
        ) : null}
      </div>

      <fieldset aria-describedby="kit-hint">
        <legend className={LABEL}>{F.kit.label}</legend>
        <p id="kit-hint" className="mt-1 text-sm text-muted">
          {F.kit.hint}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {BLOCK_IDS.map((id) => (
            <label
              key={id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 has-checked:border-brand has-checked:bg-brand-soft"
            >
              <input type="checkbox" name="kit" value={id} checked={kit.includes(id)} onChange={() => toggleBlock(id)} className="size-5 accent-[#6F32D6]" />
              <span className="font-medium">{blockName(id, businessId)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="book-time" className={LABEL}>
          {F.time.label}
        </label>
        <select
          id="book-time"
          name="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-invalid={errors.time ? true : undefined}
          aria-describedby={describedBy("time")}
          className={FIELD}
        >
          {BOOK_PAGE.times.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {errors.time ? (
          <p id="time-error" className={ERROR}>
            {errors.time}
          </p>
        ) : null}
      </div>

      {/* The honeypot: off screen, out of the tab order, hidden from screen readers. People never fill it; bots do. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="book-company-url">{BOOK_PAGE.honeypot}</label>
        <input ref={honeypotRef} id="book-company-url" name="company_url" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div>
        <button type="submit" disabled={busy} className={`${PRIMARY} w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto`}>
          {busy ? BOOK_PAGE.sending : BOOK_PAGE.submit}
        </button>
        <p className="mt-4 text-sm text-muted">{BOOK_PAGE.privacy}</p>
      </div>

      {sending.kind === "failed" ? (
        <div ref={resultRef} tabIndex={-1} role="alert" className="scroll-mt-24 rounded-2xl border border-brand-line bg-brand-soft p-5">
          <p className="font-semibold text-ink">{BOOK_PAGE.failTitle}</p>
          <p className="mt-1 text-ink/80">{BOOK_PAGE.failLine}</p>
          <a href={sending.mailto} className={`${PRIMARY} mt-4 px-6`}>
            {BOOK_PAGE.emailInstead}
          </a>
        </div>
      ) : null}
    </form>
  );
}
