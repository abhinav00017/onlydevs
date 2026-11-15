// @vitest-environment node
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/admin/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import nextConfig from "@/next.config";
import { periodStarts } from "@/lib/requests/time";

describe("/admin stays private", () => {
  it("is noindex, nofollow", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("is not in the sitemap, and nothing under /api is", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.includes("/admin"))).toBe(false);
    expect(urls.some((u) => u.includes("/api"))).toBe(false);
    expect(urls.length).toBeGreaterThan(5);
  });

  it("sends no-store and X-Robots-Tag for the page and its APIs", async () => {
    const rules = await nextConfig.headers!();
    for (const source of ["/admin", "/api/admin/:path*", "/api/book"]) {
      const rule = rules.find((r) => r.source === source);
      expect(rule, source).toBeDefined();
      expect(rule!.headers).toEqual(
        expect.arrayContaining([
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ]),
      );
    }
  });

  it("leaves robots.txt as it was", () => {
    expect(robots().rules).toMatchObject({ allow: "/" });
  });
});

describe("this week and this month, in the founders' time zone (Asia/Kolkata, UTC+5:30)", () => {
  it("start on Monday and on the 1st, at local midnight", () => {
    // Sunday 15 Nov 2026, 20:00 UTC is already Monday 16 Nov, 01:30 in Kolkata: a new week there.
    const { weekStart, monthStart } = periodStarts(new Date("2026-11-15T20:00:00Z"));
    expect(weekStart.toISOString()).toBe("2026-11-15T18:30:00.000Z");
    expect(monthStart.toISOString()).toBe("2026-10-31T18:30:00.000Z");
  });

  it("go back across a month edge to the right Monday", () => {
    // Sunday 1 Mar 2026, noon in Kolkata: the week began on Monday 23 Feb.
    const { weekStart, monthStart } = periodStarts(new Date("2026-03-01T06:30:00Z"));
    expect(weekStart.toISOString()).toBe("2026-02-22T18:30:00.000Z");
    expect(monthStart.toISOString()).toBe("2026-02-28T18:30:00.000Z");
  });
});
