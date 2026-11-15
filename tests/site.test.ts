import { describe, expect, it } from "vitest";
import { demoUrl, SITE, VERTICALS } from "@/lib/site";

describe("site facts", () => {
  it("shows only the onlydevs email as contact", () => {
    expect(SITE.email).toBe("onlydevs2002@gmail.com");
  });
  it("lists the verticals with Business CRM, never tiles", () => {
    expect(VERTICALS.map((v) => v.name)).toContain("Business CRM");
    expect(VERTICALS.some((v) => /tile/i.test(v.name))).toBe(false);
  });
  it("builds demo links on the demo hub", () => {
    expect(demoUrl("/clinic")).toBe(`${SITE.demoBaseUrl}/clinic`);
  });
});
