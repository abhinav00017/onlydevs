import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/content";
import { SITE, VERTICALS } from "@/lib/site";

/** Every public page. No lastModified: it would only be a guess. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/services",
    ...SERVICES.map((s) => `/services/${s.slug}`),
    "/products",
    "/industries",
    ...VERTICALS.map((v) => `/industries/${v.slug}`),
    "/demos",
    "/pricing",
    "/about",
    "/book",
  ];
  return paths.map((path) => ({ url: `${SITE.url}${path === "/" ? "" : path}`, priority: path === "/" ? 1 : 0.7 }));
}
