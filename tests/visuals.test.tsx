import { cleanup, render, screen } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { ImgHTMLAttributes } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import nextConfig from "@/next.config";
import { FIX_PHOTOS, PHOTOS, PHOTO_LIST, UNSPLASH_QUERY } from "@/lib/photos";

/**
 * The visuals rules (Abhinav, 15 Nov 2026: "Real photos + floating UI"):
 * no WebGL anywhere, photos only from Unsplash's image host, nothing fixed to India.
 */

const root = process.cwd();
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

function sourceFiles(dir: string, out: string[] = []): string[] {
  const abs = resolve(root, dir);
  if (!existsSync(abs)) return out;
  for (const name of readdirSync(abs)) {
    const rel = join(dir, name);
    if (statSync(resolve(root, rel)).isDirectory()) sourceFiles(rel, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(name)) out.push(rel);
  }
  return out;
}

const APP_FILES = [...sourceFiles("app"), ...sourceFiles("components"), ...sourceFiles("lib"), "next.config.ts"];

describe("no WebGL", () => {
  it("has no components/three folder", () => {
    expect(existsSync(resolve(root, "components/three"))).toBe(false);
  });

  it("imports nothing from components/three, three or React Three Fiber on any page or component", () => {
    for (const file of APP_FILES) {
      const text = read(file);
      expect(text, file).not.toMatch(/components\/three/);
      expect(text, file).not.toMatch(/from\s+["'](three|three\/[^"']*|@react-three\/[^"']*)["']/);
      expect(text, file).not.toMatch(/import\(\s*["'](three|@react-three\/[^"']*)["']\s*\)/);
    }
  });

  it("does not depend on three, @types/three or any @react-three package", () => {
    const pkg = JSON.parse(read("package.json")) as Record<string, Record<string, string> | undefined>;
    const names = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
    for (const name of names) expect(name).not.toMatch(/^(three|@types\/three|@react-three\/.*)$/);
  });
});

describe("photos (lib/photos.ts)", () => {
  it("has seven to nine photos, each with a page, a photographer, alt text, where it is used and a licence check", () => {
    expect(PHOTO_LIST.length).toBeGreaterThanOrEqual(7);
    expect(PHOTO_LIST.length).toBeLessThanOrEqual(9);
    expect(new Set(PHOTO_LIST.map((p) => p.id)).size).toBe(PHOTO_LIST.length);
    expect(new Set(PHOTO_LIST.map((p) => p.src)).size).toBe(PHOTO_LIST.length);
    for (const p of PHOTO_LIST) {
      expect(p.photographer.trim(), p.id).not.toBe("");
      expect(p.alt.trim().length, p.id).toBeGreaterThan(10);
      expect(p.usedIn.trim(), p.id).not.toBe("");
      expect(p.color, p.id).toMatch(/^#[0-9a-f]{6}$/i);
      expect(p.licenceChecked, p.id).toBe(true);
    }
  });

  it("loads every image from images.unsplash.com only, at the one allowed source size", () => {
    for (const p of PHOTO_LIST) {
      const url = new URL(p.src);
      expect(url.protocol, p.id).toBe("https:");
      expect(url.hostname, p.id).toBe("images.unsplash.com");
      expect(url.pathname, p.id).toMatch(/^\/photo-[\w-]+$/);
      expect(url.search, p.id).toBe(UNSPLASH_QUERY);
    }
  });

  it("links each photo to its own page on unsplash.com, never an Unsplash+ image", () => {
    for (const p of PHOTO_LIST) {
      const url = new URL(p.page);
      expect(url.hostname, p.id).toBe("unsplash.com");
      expect(url.pathname, p.id).toMatch(/^\/photos\/[\w-]+$/);
    }
    expect(read("lib/photos.ts")).not.toMatch(/plus\.unsplash\.com|premium_photo/);
  });

  it("names no host in lib/photos.ts but images.unsplash.com (images) and unsplash.com (photo pages)", () => {
    const hosts = [...read("lib/photos.ts").matchAll(/https?:\/\/([^/"'`\s?]+)/g)].map((m) => m[1]);
    expect(hosts.length).toBeGreaterThan(0);
    for (const host of hosts) expect(["images.unsplash.com", "unsplash.com"]).toContain(host);
  });

  it("lets next/image fetch from images.unsplash.com only, with the same source size", () => {
    const patterns = nextConfig.images?.remotePatterns ?? [];
    expect(patterns.length).toBeGreaterThan(0);
    for (const pattern of patterns) {
      expect(pattern).not.toBeInstanceOf(URL);
      const p = pattern as { protocol?: string; hostname: string; search?: string };
      expect(p.protocol).toBe("https");
      expect(p.hostname).toBe("images.unsplash.com");
      expect(p.search).toBe(UNSPLASH_QUERY);
    }
  });

  it("gives every fix scene its own photo", () => {
    expect(FIX_PHOTOS).toHaveLength(6);
    expect(new Set(FIX_PHOTOS).size).toBe(6);
  });
});

describe("global, not India-only", () => {
  const INDIA_ONLY = /\bGST\b|\bUPI\b|\blakhs?\b|₹|\bIndian?\b|\bRs\.?\s*\d|\bINR\b/i;
  it.each(["lib/content.ts", "components/visuals/sample.ts", "lib/photos.ts"])("%s has no India-only words", (file) => {
    expect(read(file)).not.toMatch(INDIA_ONLY);
  });

  it("puts no currency symbol in the sample screens", () => {
    expect(read("components/visuals/sample.ts")).not.toMatch(/[₹$€£¥]/);
  });

  it("never names Ogi in the visuals: the assistant is plain chat UI", () => {
    for (const file of sourceFiles("components/visuals")) expect(read(file), file).not.toMatch(/\bOgi\b/);
  });
});

/* ---------- Rendering, with next/image as a plain <img> ---------- */

vi.mock("next/image", () => ({
  default: ({ src, alt, preload, sizes, className, style }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; preload?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={String(src)} alt={alt} sizes={sizes} className={className} style={style} data-preload={preload ? "true" : undefined} />
  ),
}));

class IO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe() {
    this.cb([{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", IO);
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  }));
});
afterEach(cleanup);

describe("scenes render", () => {
  it("HeroScene shows the hero photo, preloaded, with six chaos pieces over it", async () => {
    const { HeroScene } = await import("@/components/visuals");
    const { container } = render(<HeroScene progress={0} className="aspect-square" />);
    const img = screen.getByAltText(PHOTOS.hero.alt);
    expect(img.getAttribute("data-preload")).toBe("true");
    expect(img.getAttribute("sizes")).toBeTruthy();
    expect(container.querySelectorAll('[aria-hidden="true"] > .absolute')).toHaveLength(6);
    expect(container.textContent).toMatch(/Missed calls/);
    expect(container.textContent).toMatch(/Double booked/);
  });

  it("FixScene shows one photo and one product screen for each step, and only the hero preloads", async () => {
    const { FixScene } = await import("@/components/visuals");
    const expected = [/cafe near me/, /New, booked online/, /Next follow-up/, /AI assistant/, /Tonight at 7 pm/, /This week/];
    for (const step of [0, 1, 2, 3, 4, 5] as const) {
      const { container, unmount } = render(<FixScene step={step} className="aspect-square" />);
      const photo = PHOTOS[FIX_PHOTOS[step]];
      const img = screen.getByAltText(photo.alt);
      expect(img.getAttribute("data-preload")).toBeNull();
      expect(container.textContent, `step ${step}`).toMatch(expected[step]);
      unmount();
    }
  });

  it("CalmScene shows the calm photo, a phone and a dashboard card", async () => {
    const { CalmScene } = await import("@/components/visuals");
    const { container } = render(<CalmScene />);
    expect(screen.getByAltText(PHOTOS.calm.alt)).toBeTruthy();
    expect(container.textContent).toMatch(/All caught up/);
    expect(container.textContent).toMatch(/This week/);
  });
});

describe("KitBlocks", () => {
  it("shows one card per block, once each, in the order given", async () => {
    const { KitBlocks } = await import("@/components/visuals");
    const { container } = render(<KitBlocks blocks={["website", "orders", "ogi", "website", "dashboard"]} />);
    const ids = [...container.querySelectorAll("[data-block]")].map((el) => el.getAttribute("data-block"));
    expect(ids).toEqual(["website", "orders", "ogi", "dashboard"]);
    expect(container.textContent).toMatch(/AI assistant/);
    expect(container.textContent).not.toMatch(/\bOgi\b/);
  });

  it("names blocks for the business, e.g. bookings for a clinic", async () => {
    const { KitBlocks } = await import("@/components/visuals");
    const { container } = render(<KitBlocks blocks={["orders"]} business="clinic" />);
    expect(container.textContent).toBe("Bookings");
  });

  it("gives an unknown id a neutral card with a tidy label", async () => {
    const { KitBlocks } = await import("@/components/visuals");
    const { container } = render(<KitBlocks blocks={["loyalty_points"]} />);
    const card = container.querySelector('[data-block="loyalty_points"]');
    expect(card?.textContent).toBe("Loyalty Points");
    expect(card?.className).not.toMatch(/ring-ink\/\[0\.07\]/);
  });

  it("shows empty slots and no cards when the kit is empty", async () => {
    const { KitBlocks } = await import("@/components/visuals");
    const { container } = render(<KitBlocks blocks={[]} />);
    expect(container.querySelectorAll("[data-block]")).toHaveLength(0);
  });
});
