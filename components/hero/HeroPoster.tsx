import type { CSSProperties } from "react";
import { cx } from "@/components/site/ui";
import { FRAMING, POSES } from "./choreography";
import { POSTER, type PosterShot } from "./poster";

/** A 1×1 transparent GIF: phones and "reduce motion" never download the poster. */
const NOTHING = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Size and place a poster shot the way the 3D scene would frame it on the current stage, in CSS only
 * (container units of the stage), so it is right on the first paint, before any script.
 * The scene's pixels per unit are min(widthShare × W / compositionWidth, heightShare × H / compositionHeight)
 * (choreography.ts, pixelsPerUnit); the shot is scaled by that over its own `ppu`, and its focus point is put
 * where the scene puts the focus.
 */
function placement(shot: PosterShot, f: { widthShare: number; heightShare: number }, screenX: number, screenY: number) {
  const perW = (shot.crop.width * f.widthShare) / FRAMING.composition.width / shot.ppu;
  const perH = (shot.crop.width * f.heightShare) / FRAMING.composition.height / shot.ppu;
  return {
    width: `min(${(perW * 100).toFixed(3)}cqw, ${(perH * 100).toFixed(3)}cqh)`,
    left: `${(((1 + screenX) / 2) * 100).toFixed(3)}%`,
    top: `${(((1 - screenY) / 2) * 100).toFixed(3)}%`,
    tx: `${(-((shot.focus.x - shot.crop.x) / shot.crop.width) * 100).toFixed(3)}%`,
    ty: `${(-((shot.focus.y - shot.crop.y) / shot.crop.height) * 100).toFixed(3)}%`,
  };
}

/**
 * The hero poster: a still of our own 3D scene at step 0, lined up with the live canvas, shown at once on desktops and
 * tablets (with motion allowed) while the 3D loads. The live scene cross-fades over it. Hidden on phones and for
 * "reduce motion", which get the flat CSS device instead. Regenerate with `npm run hero:poster`.
 */
export function HeroPoster({ className }: { className?: string }) {
  const cafe = POSES[0];
  const w = placement(POSTER.wide, FRAMING.wide, cafe.screenX, cafe.screenY);
  const t = placement(POSTER.tall, FRAMING.tall, 0, cafe.screenY + FRAMING.tall.shiftY);
  const vars = {
    "--pw": w.width,
    "--pl": w.left,
    "--pt": w.top,
    "--ptx": w.tx,
    "--pty": w.ty,
    "--tw": t.width,
    "--tl": t.left,
    "--tt": t.top,
    "--ttx": t.tx,
    "--tty": t.ty,
  } as CSSProperties;
  const wideOnly = "(min-width: 40rem) and (prefers-reduced-motion: no-preference)";
  return (
    <>
      {/* Preloads (React puts them in <head>): the poster loads alongside the CSS, so it is there at first paint. */}
      <link rel="preload" as="image" href={POSTER.wide.src} media={`${wideOnly} and (min-aspect-ratio: 23/20)`} fetchPriority="high" />
      <link rel="preload" as="image" href={POSTER.tall.src} media={`${wideOnly} and (max-aspect-ratio: 23/20)`} />
      <PosterPicture className={className} vars={vars} />
    </>
  );
}

function PosterPicture({ className, vars }: { className?: string; vars: CSSProperties }) {
  return (
    <picture data-hero-poster className={cx("pointer-events-none absolute inset-0 hidden sm:motion-safe:block", className)} style={vars}>
      <source media="(max-width: 39.99rem), (prefers-reduced-motion: reduce)" srcSet={NOTHING} />
      <source media={`(max-aspect-ratio: ${Math.round(FRAMING.wide.minAspect * 20)}/20)`} srcSet={POSTER.tall.src} width={POSTER.tall.width} height={POSTER.tall.height} />
      {/* A plain img: the file is ours, already sized and compressed by the poster script; next/image would only add a hop. */}
      <img
        src={POSTER.wide.src}
        width={POSTER.wide.width}
        height={POSTER.wide.height}
        alt=""
        decoding="async"
        fetchPriority="high"
        className={cx(
          "absolute h-auto max-w-none select-none",
          "top-(--pt) left-(--pl) w-(--pw) translate-x-(--ptx) translate-y-(--pty)",
          "[@media(max-aspect-ratio:23/20)]:top-(--tt) [@media(max-aspect-ratio:23/20)]:left-(--tl) [@media(max-aspect-ratio:23/20)]:w-(--tw)",
          "[@media(max-aspect-ratio:23/20)]:translate-x-(--ttx) [@media(max-aspect-ratio:23/20)]:translate-y-(--tty)",
        )}
      />
    </picture>
  );
}
