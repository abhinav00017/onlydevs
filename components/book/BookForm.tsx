"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { BOOK_PAGE, KIT, blockName } from "@/lib/content";
import { bookingMailto, validateBooking, type FieldErrors } from "@/lib/book";
import { BLOCK_IDS, businessSchema, kitFromSearchParams, sortBlocks, type BlockId, type BusinessId, type Kit } from "@/lib/kit";
import { SITE } from "@/lib/site";

const F = BOOK_PAGE.fields;
const FIELD =
  "mt-2 block w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-ink placeholder:text-muted/70 focus-visible:border-brand aria-invalid:border-red-600";
const LABEL = "block text-base font-semibold text-ink";
const ERROR = "mt-2 text-sm font-medium text-red-700";
const ORDER = ["name", "business", "contact", "time"] as const;

/** Reads the kit from the URL (/book?business=cafe&kit=website,orders) and prefills the form. */
export function BookFormFromUrl() {
  const params = useSearchParams();
  const kit = kitFromSearchParams(params);
  return <BookForm key={params.toString()} initial={kit} />;
}

/** The "Book a free call" form. Validates first, then opens the visitor's email app with the request written out. */
export function BookForm({ initial }: { initial?: Kit }) {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState<string>(initial?.business ?? "");
  const [contact, setContact] = useState("");
  const [kit, setKit] = useState<BlockId[]>(initial?.blocks ?? []);
  const [time, setTime] = useState<string>(BOOK_PAGE.times[0]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  const businessId = businessSchema.safeParse(business).success ? (business as BusinessId) : undefined;

  function toggleBlock(id: BlockId) {
    setKit((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : sortBlocks([...prev, id])));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = validateBooking({ name, business, contact, kit, time });
    if (!result.ok) {
      setErrors(result.errors);
      setSent(false);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    setSent(true);
    window.location.href = bookingMailto(result.data);
    requestAnimationFrame(() => sentRef.current?.focus());
  }

  const errorList = ORDER.filter((k) => errors[k]);
  const describedBy = (key: keyof FieldErrors, hint?: boolean) =>
    [hint ? `${key}-hint` : "", errors[key] ? `${key}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-8" aria-label={BOOK_PAGE.title}>
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

      <div>
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-strong sm:w-auto"
        >
          {BOOK_PAGE.submit}
        </button>
        <p className="mt-4 text-sm text-muted">{BOOK_PAGE.privacy}</p>
      </div>

      {sent ? (
        <div ref={sentRef} tabIndex={-1} role="status" className="rounded-2xl border border-brand-line bg-brand-soft p-5">
          <p className="font-semibold text-ink">{BOOK_PAGE.sentTitle}</p>
          <p className="mt-1 text-ink/80">
            {BOOK_PAGE.sentLine}{" "}
            <a href={`mailto:${SITE.email}`} className="font-semibold break-words text-brand underline underline-offset-2">
              {SITE.email}
            </a>
            .
          </p>
        </div>
      ) : null}
    </form>
  );
}
