import { describe, expect, it } from "vitest";
import { BLOCK_IDS, BUSINESS_IDS, SUGGESTED_BLOCKS, kitFromSearchParams, kitHref, kitToSearchParams, type Kit } from "@/lib/kit";
import { VERTICALS } from "@/lib/site";

describe("kit query params", () => {
  it("round-trips a kit through the URL", () => {
    const kit: Kit = { business: "cafe", blocks: ["website", "orders", "ogi"] };
    const params = kitToSearchParams(kit);
    expect(params.toString()).toBe("business=cafe&kit=website%2Corders%2Cogi");
    expect(kitFromSearchParams(new URLSearchParams(params.toString()))).toEqual(kit);
  });

  it("round-trips every suggested kit", () => {
    for (const business of BUSINESS_IDS) {
      const kit: Kit = { business, blocks: SUGGESTED_BLOCKS[business] };
      const url = new URL(kitHref(kit), "https://example.test");
      expect(url.pathname).toBe("/book");
      const back = kitFromSearchParams(url.searchParams);
      expect(back.business).toBe(business);
      expect(new Set(back.blocks)).toEqual(new Set(kit.blocks));
    }
  });

  it("reads Next.js searchParams objects too", () => {
    expect(kitFromSearchParams({ business: "events", kit: "ticketing,website" })).toEqual({ business: "events", blocks: ["website", "ticketing"] });
    expect(kitFromSearchParams({ business: ["crm", "cafe"], kit: ["crm"] })).toEqual({ business: "crm", blocks: ["crm"] });
  });

  it("drops unknown businesses and blocks, removes duplicates and fixes the order", () => {
    const kit = kitFromSearchParams(new URLSearchParams("business=bakery&kit=ogi,hack,website,ogi,%3Cscript%3E"));
    expect(kit).toEqual({ business: undefined, blocks: ["website", "ogi"] });
  });

  it("handles an empty or missing kit", () => {
    expect(kitFromSearchParams(new URLSearchParams(""))).toEqual({ business: undefined, blocks: [] });
    expect(kitHref({ blocks: [] })).toBe("/book");
    expect(kitHref({ business: "other", blocks: [] })).toBe("/book?business=other");
  });

  it("keeps the business list in step with the verticals", () => {
    expect(BUSINESS_IDS).toEqual([...VERTICALS.map((v) => v.id), "other"]);
  });

  it("suggests only real blocks, with the ones the storyboard names", () => {
    for (const blocks of Object.values(SUGGESTED_BLOCKS)) for (const b of blocks) expect(BLOCK_IDS).toContain(b);
    expect(SUGGESTED_BLOCKS.cafe).toContain("orders");
    expect(SUGGESTED_BLOCKS.realestate).toEqual(expect.arrayContaining(["crm", "orders"]));
    expect(SUGGESTED_BLOCKS.events).toContain("ticketing");
    expect(SUGGESTED_BLOCKS.clinic).toContain("orders");
    expect(SUGGESTED_BLOCKS.crm).toContain("crm");
  });
});
