"use client";

import { LogOut, Mail, Phone, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { businessLabel } from "@/lib/book";
import { blockName, KIT } from "@/lib/content";
import { BUSINESS_IDS, type BusinessId } from "@/lib/kit";
import { STATUSES, type CallRequest, type RequestCounts, type RequestStatus } from "@/lib/requests/types";
import { ADMIN, STATUS_LABEL, STATUS_STYLE } from "./copy";
import { CARD, INPUT, PRIMARY, SECONDARY } from "./styles";

type Filters = { status: RequestStatus | ""; business: BusinessId | ""; q: string };
type Loaded = { requests: CallRequest[]; counts: RequestCounts; storage: "memory" | "postgres" };

const NO_FILTERS: Filters = { status: "", business: "", q: "" };
const SELECT = `${INPUT} mt-1 min-h-11 py-2`;

function query(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.business) params.set("business", filters.business);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  const text = params.toString();
  return text ? `?${text}` : "";
}

const when = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
const telHref = (contact: string) => `tel:${contact.replace(/[^\d+]/g, "")}`;

/** The counts, the filters and the list. Loads from GET /api/admin/requests; saves with PATCH. */
export function Dashboard({ onLogout, onLoggedOut }: { onLogout: () => void; onLoggedOut: () => void }) {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Loaded>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const latest = useRef(0);
  const id = useId();

  const load = useCallback(
    async (f: Filters) => {
      const mine = ++latest.current;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/requests${query(f)}`, { cache: "no-store" });
        if (res.status === 401 || res.status === 503) return onLoggedOut();
        const body = (await res.json()) as { ok?: boolean } & Partial<Loaded>;
        if (mine !== latest.current) return;
        if (!body.ok || !body.requests || !body.counts) throw new Error("not ok");
        setData({ requests: body.requests, counts: body.counts, storage: body.storage ?? "postgres" });
        setError("");
      } catch {
        if (mine === latest.current) setError(ADMIN.loadFailed);
      } finally {
        if (mine === latest.current) setLoading(false);
      }
    },
    [onLoggedOut],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(filters);
  }, [filters, load]);

  // Search waits for a pause in typing.
  useEffect(() => {
    const timer = setTimeout(() => setFilters((f) => (f.q === search ? f : { ...f, q: search })), 300);
    return () => clearTimeout(timer);
  }, [search]);

  function saved(updated: CallRequest) {
    // Counts and filters may change with a new status, so load again; show the saved row at once meanwhile.
    setData((d) => (d ? { ...d, requests: d.requests.map((r) => (r.id === updated.id ? updated : r)) } : d));
    void load(filters);
  }

  const filtered = filters.status !== "" || filters.business !== "" || filters.q.trim() !== "";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{ADMIN.title}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load(filters)} className={SECONDARY} aria-busy={loading || undefined}>
            <RefreshCw aria-hidden className={`size-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} />
            {ADMIN.refresh}
          </button>
          <button type="button" onClick={onLogout} className={SECONDARY}>
            <LogOut aria-hidden className="size-4" />
            {ADMIN.logout}
          </button>
        </div>
      </div>

      {data?.storage === "memory" ? <p className="mt-6 rounded-2xl border border-brand-line bg-brand-soft p-4 text-sm text-ink">{ADMIN.memory}</p> : null}
      {error ? (
        <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}

      {data ? <Counts counts={data.counts} /> : <p className="py-16 text-center text-muted">{ADMIN.loading}</p>}

      {data && data.counts.total > 0 ? (
        <>
          <div role="search" className="mt-10 grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label htmlFor={`${id}-q`} className="text-sm font-semibold text-ink">
                {ADMIN.filters.search}
              </label>
              <input id={`${id}-q`} type="search" value={search} onChange={(e) => setSearch(e.target.value)} maxLength={80} className={SELECT} />
            </div>
            <div>
              <label htmlFor={`${id}-status`} className="text-sm font-semibold text-ink">
                {ADMIN.filters.status}
              </label>
              <select
                id={`${id}-status`}
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Filters["status"] }))}
                className={SELECT}
              >
                <option value="">{ADMIN.filters.all}</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-business`} className="text-sm font-semibold text-ink">
                {ADMIN.filters.business}
              </label>
              <select
                id={`${id}-business`}
                value={filters.business}
                onChange={(e) => setFilters((f) => ({ ...f, business: e.target.value as Filters["business"] }))}
                className={SELECT}
              >
                <option value="">{ADMIN.filters.all}</option>
                {BUSINESS_IDS.map((b) => (
                  <option key={b} value={b}>
                    {businessLabel(b)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {data.requests.length ? (
            <ul className="mt-6 space-y-3" aria-label={ADMIN.title}>
              {data.requests.map((r) => (
                <RequestCard key={r.id} request={r} onSaved={saved} onLoggedOut={onLoggedOut} />
              ))}
            </ul>
          ) : (
            <div className={`mt-6 text-center ${CARD}`}>
              <p className="text-muted">{ADMIN.noMatch}</p>
              {filtered ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilters(NO_FILTERS);
                  }}
                  className={`mt-4 ${SECONDARY}`}
                >
                  {ADMIN.filters.clear}
                </button>
              ) : null}
            </div>
          )}
        </>
      ) : data ? (
        <div className={`mt-10 text-center ${CARD}`}>
          <p className="text-2xl font-bold tracking-tight text-ink">{ADMIN.empty.title}</p>
          <p className="mt-2 text-muted">{ADMIN.empty.line}</p>
        </div>
      ) : null}
    </div>
  );
}

function Counts({ counts }: { counts: RequestCounts }) {
  const tiles = [
    { key: "new", label: ADMIN.counts.new, value: counts.new, strong: true },
    { key: "week", label: ADMIN.counts.week, value: counts.week },
    { key: "month", label: ADMIN.counts.month, value: counts.month },
    { key: "won", label: ADMIN.counts.won, value: counts.won },
  ];
  return (
    <section aria-label="Counts" className="mt-8">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.key} data-count={t.key} className={`rounded-3xl border p-5 ${t.strong ? "border-brand bg-brand text-white" : "border-line bg-card"}`}>
            <dt className={`text-sm font-semibold ${t.strong ? "text-white/85" : "text-muted"}`}>{t.label}</dt>
            <dd className={`mt-1 text-4xl font-bold tracking-tight tabular-nums ${t.strong ? "" : "text-ink"}`}>{t.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-3xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold text-muted">{ADMIN.counts.byBusiness}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {KIT.businesses.map((b) => (
            <li key={b.id} data-business={b.id} className="inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-1.5 text-sm text-ink">
              {b.label}
              <span className="font-bold tabular-nums">{counts.byBusiness[b.id as BusinessId] ?? 0}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RequestCard({ request: r, onSaved, onLoggedOut }: { request: CallRequest; onSaved: (r: CallRequest) => void; onLoggedOut: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<RequestStatus>(r.status);
  const [notes, setNotes] = useState(r.notes);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const id = useId();
  const kit = r.kit.length ? r.kit.map((b) => blockName(b, r.business)).join(", ") : ADMIN.row.noKit;

  function toggle() {
    if (!open) {
      setStatus(r.status);
      setNotes(r.notes);
      setState("idle");
    }
    setOpen(!open);
  }

  async function save() {
    setState("saving");
    try {
      const res = await fetch(`/api/admin/requests/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.status === 401 || res.status === 503) return onLoggedOut();
      const body = (await res.json()) as { ok?: boolean; request?: CallRequest };
      if (!res.ok || !body.ok || !body.request) throw new Error("not ok");
      setState("saved");
      onSaved(body.request);
    } catch {
      setState("failed");
    }
  }

  return (
    <li className="rounded-3xl border border-line bg-card p-5 sm:p-6" data-request={r.ref}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xl font-bold tracking-tight break-words text-ink">{r.name}</p>
          <p className="mt-0.5 text-muted">{businessLabel(r.business)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
          <span className="font-mono text-xs font-semibold tracking-wider text-muted" title={ADMIN.row.ref}>
            {r.ref}
          </span>
        </div>
      </div>

      <a
        href={r.contactKind === "email" ? `mailto:${r.contact}` : telHref(r.contact)}
        className="mt-3 inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-brand-soft px-4 font-semibold break-all text-brand-strong"
      >
        {r.contactKind === "email" ? <Mail aria-hidden className="size-4 shrink-0" /> : <Phone aria-hidden className="size-4 shrink-0" />}
        {r.contact}
      </a>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="font-semibold text-muted">{ADMIN.row.kit}</dt>
        <dd className="text-ink">{kit}</dd>
        <dt className="font-semibold text-muted">{ADMIN.row.time}</dt>
        <dd className="text-ink">{r.preferredTime}</dd>
        <dt className="font-semibold text-muted">{ADMIN.row.received}</dt>
        <dd className="text-ink">
          <time dateTime={r.createdAt}>{when(r.createdAt)}</time>
          {r.source === "ogi" ? <span className="ml-2 text-muted">via Ogi</span> : null}
        </dd>
      </dl>
      {r.notes && !open ? <p className="mt-3 rounded-2xl bg-canvas p-3 text-sm whitespace-pre-wrap text-ink">{r.notes}</p> : null}

      <button type="button" onClick={toggle} aria-expanded={open} aria-controls={`${id}-edit`} className={`mt-4 ${SECONDARY}`}>
        {open ? ADMIN.row.close : ADMIN.row.open}
      </button>

      {open ? (
        <div id={`${id}-edit`} className="mt-4 grid gap-4 border-t border-line pt-4">
          <div>
            <label htmlFor={`${id}-status`} className="text-sm font-semibold text-ink">
              {ADMIN.editor.status}
            </label>
            <select id={`${id}-status`} value={status} onChange={(e) => setStatus(e.target.value as RequestStatus)} className={SELECT}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-notes`} className="text-sm font-semibold text-ink">
              {ADMIN.editor.notes}
            </label>
            <p id={`${id}-notes-hint`} className="text-sm text-muted">
              {ADMIN.editor.notesHint}
            </p>
            <textarea
              id={`${id}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={4000}
              rows={4}
              aria-describedby={`${id}-notes-hint`}
              className={`${INPUT} resize-y`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void save()} disabled={state === "saving"} className={PRIMARY}>
              {state === "saving" ? ADMIN.editor.saving : ADMIN.editor.save}
            </button>
            <p role="status" className="text-sm font-medium">
              {state === "saved" ? <span className="text-emerald-700">{ADMIN.editor.saved}</span> : null}
              {state === "failed" ? <span className="text-red-700">{ADMIN.saveFailed}</span> : null}
            </p>
          </div>
        </div>
      ) : null}
    </li>
  );
}
