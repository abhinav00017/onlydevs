#!/usr/bin/env node
/**
 * npm run hero:poster: regenerate the hero poster from our own 3D scene.
 *
 * The poster is a still of the live hero at step 0 (Cafe), shown at once on desktops and tablets while the 3D
 * loads, lined up with the canvas (components/hero/HeroPoster.tsx). Run this whenever the scene, the devices,
 * the framing (components/hero/choreography.ts, FRAMING) or the Cafe pose (POSES[0]) changes.
 *
 * It needs the production site running and a local Chrome. Nothing is downloaded.
 *   npm run build && npx next start -p 3492 &
 *   npm run hero:poster                       # or: npm run hero:poster -- http://localhost:3492
 *   CHROME_PATH=/path/to/chrome npm run hero:poster
 *
 * It opens the home page with ?hero-poster (the live screen holds still), waits for the 3D to draw and settle,
 * hides everything but the canvas and its live screens, and saves a transparent WebP for a wide stage (desktops,
 * landscape tablets) and a tall one (portrait tablets) in public/hero/. Then it rewrites components/hero/poster.ts
 * with what HeroPoster needs to place them. tests/hero.test.tsx checks that file against the framing.
 */
import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] ?? "http://localhost:3492";
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Mirrors components/hero/choreography.ts (FRAMING, POSES[0]); tests/hero.test.tsx fails if they drift apart.
const FRAMING = {
  composition: { width: 4.9, height: 2.6 },
  wide: { minAspect: 1.15, widthShare: 0.66, heightShare: 0.82 },
  tall: { widthShare: 0.9, heightShare: 0.42, shiftY: -0.4 },
};
const CAFE = { screenX: 0.52, screenY: -0.06 };

function pixelsPerUnit(w, h) {
  const f = w / h >= FRAMING.wide.minAspect ? FRAMING.wide : FRAMING.tall;
  return Math.min((f.widthShare * w) / FRAMING.composition.width, (f.heightShare * h) / FRAMING.composition.height);
}

/** Each shot: the reference stage size, the pixel density, and the part of the stage the devices occupy. */
const SHOTS = [
  { name: "wide", width: 1440, height: 900, dpr: 1.1, crop: { x: 0.37, y: 0.16, w: 0.63, h: 0.8 }, focus: { x: CAFE.screenX, y: CAFE.screenY } },
  { name: "tall", width: 820, height: 1180, dpr: 1, crop: { x: 0, y: 0.44, w: 1, h: 0.54 }, focus: { x: 0, y: CAFE.screenY + FRAMING.tall.shiftY } },
];

const ONLY_THE_SCENE = `
  body * { visibility: hidden !important; transition: none !important; }
  [data-hero-canvas], [data-hero-canvas] * { visibility: visible !important; }
  [data-poster-ancestor] { background: transparent !important; box-shadow: none !important; }
  nextjs-portal { display: none !important; }
`;
/** Clears the page backgrounds behind the canvas (and only those), so the poster is transparent around the devices. */
const MARK_ANCESTORS = () => {
  for (let el = document.querySelector("[data-hero-canvas]"); el; el = el.parentElement) el.setAttribute("data-poster-ancestor", "");
};

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--hide-scrollbars"],
});
const out = {};
try {
  for (const shot of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: shot.dpr });
    await page.goto(`${base}/?hero-poster`, { waitUntil: "load", timeout: 60_000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForSelector('[data-hero-stage="3d"] [data-hero-canvas]', { timeout: 60_000 });
    // Drawn (the stage fades in when ready), then let the lid and the damped camera settle.
    await page.waitForFunction(() => {
      const host = document.querySelector("[data-hero-canvas]");
      const fade = host?.closest('[class*="duration-1000"]');
      return fade && getComputedStyle(fade).opacity === "1";
    }, { timeout: 60_000 });
    await new Promise((r) => setTimeout(r, 4000));
    await page.evaluate(MARK_ANCESTORS);
    await page.addStyleTag({ content: ONLY_THE_SCENE });
    await new Promise((r) => setTimeout(r, 300));

    const stage = await page.$eval("[data-hero-canvas]", (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    });
    const crop = {
      x: Math.round(stage.x + stage.width * shot.crop.x),
      y: Math.round(stage.y + stage.height * shot.crop.y),
      width: Math.round(stage.width * shot.crop.w),
      height: Math.round(stage.height * shot.crop.h),
    };
    const file = `public/hero/poster-${shot.name}.webp`;
    await mkdir(resolve(root, "public/hero"), { recursive: true });
    await page.screenshot({ path: resolve(root, file), type: "webp", quality: 72, omitBackground: true, clip: crop });
    const bytes = (await stat(resolve(root, file))).size;
    out[shot.name] = {
      src: `/hero/poster-${shot.name}.webp`,
      width: Math.round(crop.width * shot.dpr),
      height: Math.round(crop.height * shot.dpr),
      ref: { width: Math.round(stage.width), height: Math.round(stage.height) },
      ppu: pixelsPerUnit(stage.width, stage.height),
      crop: { x: crop.x - stage.x, y: crop.y - stage.y, width: crop.width, height: crop.height },
      focus: { x: ((1 + shot.focus.x) / 2) * stage.width, y: ((1 - shot.focus.y) / 2) * stage.height },
      bytes,
    };
    console.log(`${file}: ${(bytes / 1024).toFixed(1)} KB, ${out[shot.name].width}×${out[shot.name].height}`);
    await page.close();
  }
} finally {
  await browser.close();
}

const ts = `/**
 * The hero poster: a still of our own 3D scene at step 0 (Cafe), shown at once on desktops and tablets while the
 * live 3D loads, then covered by it. Written by \`npm run hero:poster\` (scripts/hero-poster.mjs); do not edit by hand.
 *
 * Each image was captured at a reference stage size. \`ppu\` is the scene's pixels per world unit there
 * (choreography.ts, pixelsPerUnit), \`crop\` is the captured rectangle in CSS pixels, and \`focus\` is where the camera's
 * focus point sat, in those same pixels. HeroPoster scales and places the image from these, so it lines up with the
 * live scene on any stage size.
 */
export type PosterShot = {
  src: string;
  width: number;
  height: number;
  ref: { width: number; height: number };
  ppu: number;
  crop: { x: number; y: number; width: number; height: number };
  focus: { x: number; y: number };
  bytes: number;
};

export const POSTER: { wide: PosterShot; tall: PosterShot } = ${JSON.stringify(out, null, 2).replace(/"(\w+)":/g, "$1:")};
`;
await writeFile(resolve(root, "components/hero/poster.ts"), ts);
console.log("components/hero/poster.ts updated");
