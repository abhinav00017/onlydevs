import { SITE } from "@/lib/site";

/** Placeholder. The real home page follows docs/storyboard.html. */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-4">
      <h1 className="text-5xl font-bold tracking-tight">
        onlydevs<span className="text-brand">.</span>
      </h1>
      <p className="text-lg text-muted">{SITE.tagline}</p>
    </main>
  );
}
