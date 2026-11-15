"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mounts a 3D scene only while it is on or near the screen, and shows `fallback` otherwise.
 * The box keeps its size either way (give it an aspect ratio), so nothing shifts when 3D loads.
 * Unmounting far-away scenes keeps the number of live WebGL canvases small on phones.
 */
export function InView3D({
  children,
  fallback = null,
  className,
  rootMargin = "50% 0px",
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {near ? children : fallback}
    </div>
  );
}
