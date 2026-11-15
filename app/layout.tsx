import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE.domain}`),
  title: { default: "onlydevs: software that makes business easy and stress-free", template: "%s | onlydevs" },
  description:
    "onlydevs builds and looks after websites, online orders and bookings, CRMs, reminders, dashboards and an AI assistant for local businesses and growing teams.",
};

export const viewport: Viewport = { themeColor: "#F2F7F8" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
