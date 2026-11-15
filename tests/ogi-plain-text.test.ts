import { describe, expect, it } from "vitest";
import { toPlainText } from "@/lib/ogi/plainText";

describe("Ogi replies become plain text", () => {
  it.each([
    ["Please press the **Book a free call** button.", "Please press the Book a free call button."],
    ["Pricing is ***price on call***.", "Pricing is price on call."],
    ["Kits are __built for you__.", "Kits are built for you."],
    ["Demos are *made-up businesses*.", "Demos are made-up businesses."],
    ["Demos are _made-up businesses_.", "Demos are made-up businesses."],
    ["## Services\nWe build websites.", "Services\nWe build websites."],
    ["- Website\n- CRM\n* Dashboards", "• Website\n• CRM\n• Dashboards"],
    ["See [our pricing](/pricing).", "See our pricing."],
    ["Write to `onlydevs2002@gmail.com`.", "Write to onlydevs2002@gmail.com."],
    ["Line one\n\n\n\nLine two", "Line one\n\nLine two"],
  ])("%j", (input, expected) => {
    expect(toPlainText(input)).toBe(expected);
  });

  it.each([
    "Pricing is on call: a one-time setup, then a small monthly fee.",
    "1. A free call\n2. A live demo",
    "Try the demo at https://od-demo-lyart.vercel.app/clinic/website.",
    "See /services/website-and-google for more.",
  ])("leaves plain text alone: %j", (input) => {
    expect(toPlainText(input)).toBe(input);
  });

  it("never leaves an asterisk pair behind", () => {
    expect(toPlainText("Press **Book** and then **send the form**")).not.toContain("*");
  });
});
