"use client";

import { Lock } from "lucide-react";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { ADMIN } from "./copy";
import { Dashboard } from "./Dashboard";
import { CARD, INPUT, PRIMARY } from "./styles";

type View = { kind: "loading" } | { kind: "error" } | { kind: "off" } | { kind: "login" } | { kind: "in" };

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const id = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setPassword("");
        onDone();
      } else setError(data.error ?? ADMIN.login.failed);
    } catch {
      setError(ADMIN.unreachable);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={`mx-auto max-w-md ${CARD}`} aria-label={ADMIN.login.title}>
      <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-brand-soft">
        <Lock strokeWidth={1.75} className="size-5 text-brand" />
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink">{ADMIN.login.title}</h1>
      <p className="mt-2 text-muted">{ADMIN.login.line}</p>
      <label htmlFor={`${id}-pw`} className="mt-6 block font-semibold text-ink">
        {ADMIN.login.password}
      </label>
      <input
        id={`${id}-pw`}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={INPUT}
      />
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy || !password} className={`mt-6 w-full ${PRIMARY}`}>
        {busy ? ADMIN.login.checking : ADMIN.login.submit}
      </button>
    </form>
  );
}

/** The private admin page: "not set up", the password form, or the dashboard. Everything loads in the browser. */
export function AdminApp() {
  const [view, setView] = useState<View>({ kind: "loading" });

  const start = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (res.status === 503) return setView({ kind: "off" });
      const data = (await res.json()) as { ok?: boolean; authed?: boolean };
      setView(data.ok && data.authed ? { kind: "in" } : { kind: "login" });
    } catch {
      setView({ kind: "error" });
    }
  }, []);

  useEffect(() => {
    // The static page asks the API, once, who is looking. setView runs after the fetch, not during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void start();
  }, [start]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setView({ kind: "login" });
  }

  switch (view.kind) {
    case "loading":
      return <p className="py-16 text-center text-muted">{ADMIN.loading}</p>;
    case "error":
      return (
        <p role="alert" className={`mx-auto max-w-md ${CARD}`}>
          {ADMIN.unreachable}
        </p>
      );
    case "off":
      return (
        <div className={`mx-auto max-w-md ${CARD}`}>
          <h1 className="text-3xl font-bold tracking-tight text-ink">{ADMIN.notSetUp.title}</h1>
          <p className="mt-3 text-muted">{ADMIN.notSetUp.line}</p>
        </div>
      );
    case "login":
      return <Login onDone={() => void start()} />;
    case "in":
      return <Dashboard onLoggedOut={() => void start()} onLogout={() => void logout()} />;
  }
}
