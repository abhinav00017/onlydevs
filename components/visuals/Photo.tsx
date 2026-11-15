import Image from "next/image";
import type { Photo } from "@/lib/photos";
import { cx } from "@/components/site/ui";

/**
 * A photo in a fixed box: the box keeps its size, so nothing shifts when the image arrives.
 * The photo's average colour fills the box while it loads. Give the parent an aspect ratio and `relative`.
 */
export function PhotoFill({
  photo,
  sizes,
  preload = false,
  className,
}: {
  photo: Photo;
  /** What width the box is at each breakpoint, so the browser picks the right file. */
  sizes: string;
  /** Only the hero photo preloads. */
  preload?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("absolute inset-0 overflow-hidden", className)} style={{ backgroundColor: photo.color }}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover"
        style={photo.focus ? { objectPosition: photo.focus } : undefined}
      />
    </div>
  );
}
