import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";
import { Container } from "@/components/site/ui";

/** Private. Not in the sitemap, never indexed; next.config.ts also sends no-store and X-Robots-Tag for /admin. */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** The founders' admin page. The page is a static shell; the session and the requests load in the browser. */
export default function AdminPage() {
  return (
    <Container className="py-12 sm:py-16">
      <AdminApp />
    </Container>
  );
}
