import { describe, expect, it } from "vitest";
import { bookingMailto, isEmail, isPhone, validateBooking, type BookingInput } from "@/lib/book";
import { BOOK_PAGE } from "@/lib/content";
import { SITE } from "@/lib/site";

const good: BookingInput = { name: "Asha", business: "cafe", contact: "asha@example.com", kit: ["ogi", "website"], time: "Weekday morning" };

describe("call form validation", () => {
  it("accepts a complete request and cleans it", () => {
    const result = validateBooking({ ...good, name: "  Asha  " });
    expect(result).toEqual({ ok: true, data: { ...good, name: "Asha", kit: ["website", "ogi"] } });
  });

  it("accepts a phone number instead of an email", () => {
    expect(validateBooking({ ...good, contact: "+91 98765 43210" }).ok).toBe(true);
    expect(validateBooking({ ...good, contact: "(040) 1234-567" }).ok).toBe(true);
  });

  it("allows an empty kit", () => {
    expect(validateBooking({ ...good, kit: [] }).ok).toBe(true);
  });

  it("gives one friendly message per missing field", () => {
    const result = validateBooking({ name: " ", business: "", contact: "", kit: [], time: "" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual({
      name: BOOK_PAGE.errors.name,
      business: BOOK_PAGE.errors.business,
      contact: BOOK_PAGE.errors.contact,
      time: BOOK_PAGE.errors.time,
    });
  });

  it("rejects contact details that are neither a phone nor an email", () => {
    for (const contact of ["asha", "asha@", "12345", "call me", "asha@example"]) {
      const result = validateBooking({ ...good, contact });
      expect(result.ok, contact).toBe(false);
      if (!result.ok) expect(result.errors.contact).toBe(BOOK_PAGE.errors.contactInvalid);
    }
  });

  it("rejects an unknown business or block", () => {
    expect(validateBooking({ ...good, business: "bakery" }).ok).toBe(false);
    expect(validateBooking({ ...good, kit: ["website", "hack"] }).ok).toBe(false);
  });

  it("knows phones and emails", () => {
    expect(isPhone("9876543210")).toBe(true);
    expect(isPhone("98765")).toBe(false);
    expect(isPhone("98765abc43")).toBe(false);
    expect(isEmail("a@b.co")).toBe(true);
    expect(isEmail("a@b")).toBe(false);
  });
});

describe("the email the form opens", () => {
  it("goes to the onlydevs email with a clear subject and body", () => {
    const result = validateBooking(good);
    if (!result.ok) throw new Error("expected a valid booking");
    const href = bookingMailto(result.data);
    expect(href.startsWith(`mailto:${SITE.email}?`)).toBe(true);
    const params = new URLSearchParams(href.slice(href.indexOf("?") + 1));
    expect(params.get("subject")).toBe("Free call request: Asha, Cafe and restaurant");
    const body = params.get("body") ?? "";
    expect(body).toContain("Name: Asha");
    expect(body).toContain("Business: Cafe and restaurant");
    expect(body).toContain("Phone or email: asha@example.com");
    expect(body).toContain("Good time to call: Weekday morning");
    expect(body).toContain("- Website with your menu");
    expect(body).toContain("- AI assistant");
  });

  it("says when no kit was picked", () => {
    const result = validateBooking({ ...good, kit: [] });
    if (!result.ok) throw new Error("expected a valid booking");
    expect(decodeURIComponent(bookingMailto(result.data))).toContain("- Not sure yet");
  });
});
