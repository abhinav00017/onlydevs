import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { BottomBar } from "@/components/site/BottomBar";
import { Footer } from "@/components/site/Footer";
import { OgiLauncher } from "@/components/ogi/OgiLauncher";
import { Header } from "@/components/site/Header";
import { JsonLd, organizationJsonLd } from "@/components/site/JsonLd";
import { META } from "@/lib/content";
import { SITE } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: META.home.title, template: "%s | onlydevs" },
  description: META.home.description,
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, locale: "en_IN", url: "/" },
  twitter: { card: "summary" },
};

export const viewport: Viewport = { themeColor: "#F2F7F8" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <JsonLd data={organizationJsonLd()} />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <BottomBar />
        <OgiLauncher />
      </body>
    </html>
  );
}
