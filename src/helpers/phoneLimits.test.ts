import { describe, it, expect } from "vitest";
import {
  getPhoneInputLimits,
  getFormattedMaxLength,
  getUnformattedMaxLength,
  sanitizePhoneInput,
  looksLikePhone,
} from "./phoneLimits";

describe("phoneLimits", () => {
  describe("getFormattedMaxLength", () => {
    it("returns formatted length for valid countries", () => {
      expect(getFormattedMaxLength("IN")).toBe(15); // +91 81234 56789
      expect(getFormattedMaxLength("US")).toBe(15); // +1 201 555 0123
      expect(getFormattedMaxLength("GB")).toBe(15); // +44 7400 123456
    });

    it("returns null for unknown country", () => {
      expect(getFormattedMaxLength("XY")).toBeNull();
    });
  });

  describe("getUnformattedMaxLength", () => {
    it("returns unformatted length (digits + plus) for valid countries", () => {
      expect(getUnformattedMaxLength("IN")).toBe(13); // +918123456789
      expect(getUnformattedMaxLength("US")).toBe(12); // +12015550123
      expect(getUnformattedMaxLength("GB")).toBe(13); // +447400123456
    });
  });

  describe("getPhoneInputLimits", () => {
    describe("India (fixed 10 digits)", () => {
      it("format=true, hideDialCode=false", () => {
        expect(getPhoneInputLimits("IN", true, false)).toEqual({
          maxLength: 16, // "+91 81234 56789" (prefix has space)
          minLength: 14, // "+91 81234 5678" -> minimum length from libphonenumber is handled
        });
      });

      it("format=true, hideDialCode=true", () => {
        expect(getPhoneInputLimits("IN", true, true)).toEqual({
          maxLength: 11, // "81234 56789"
          minLength: 9,
        });
      });

      it("format=false, hideDialCode=false", () => {
        expect(getPhoneInputLimits("IN", false, false)).toEqual({
          maxLength: 14, // "+91 8123456789"
          minLength: 12, // "+91 812345678"
        });
      });

      it("format=false, hideDialCode=true", () => {
        expect(getPhoneInputLimits("IN", false, true)).toEqual({
          maxLength: 10, // "8123456789"
          minLength: 8,
        });
      });
    });

    describe("US (fixed 10 digits with brackets)", () => {
      it("format=true, hideDialCode=false", () => {
        expect(getPhoneInputLimits("US", true, false)).toEqual({
          maxLength: 16, // "+1 (201) 555-0123"
          minLength: 16, // US min == max in most standard definitions
        });
      });
    });

    describe("UK (variable length 7-10 digits)", () => {
      it("format=true, hideDialCode=false", () => {
        expect(getPhoneInputLimits("GB", true, false)).toEqual({
          maxLength: 16, // "+44 7400 123456"
          minLength: 13, // "+44 7400 123"
        });
      });

      it("format=true, hideDialCode=true", () => {
        expect(getPhoneInputLimits("GB", true, true)).toEqual({
          maxLength: 10, // "7400 123456" (as-you-type)
          minLength: 7,
        });
      });
    });

    it("returns null for unknown country", () => {
      expect(getPhoneInputLimits("XY", true, false)).toBeNull();
    });
  });

  describe("sanitizePhoneInput", () => {
    const limits = { maxLength: 10, minLength: 5 };

    it("allows empty value", () => {
      expect(sanitizePhoneInput("", "+1", limits, false)).toBe("");
    });

    it("allows value under limit during normal typing", () => {
      expect(sanitizePhoneInput("123456789", "12345678", limits, false)).toBe("123456789");
    });

    it("allows value exactly at limit during normal typing", () => {
      expect(sanitizePhoneInput("1234567890", "123456789", limits, false)).toBe("1234567890");
    });

    it("blocks value over limit during normal typing (returns oldValue)", () => {
      expect(sanitizePhoneInput("12345678901", "1234567890", limits, false)).toBe("1234567890");
    });

    it("trims value over limit during paste", () => {
      expect(sanitizePhoneInput("123456789012345", "", limits, true)).toBe("1234567890");
    });

    it("passes through if limits are null", () => {
      expect(sanitizePhoneInput("123456789012345", "", null, false)).toBe("123456789012345");
    });
  });

  describe("looksLikePhone", () => {
    it("returns true for strings starting with plus", () => {
      expect(looksLikePhone("+123")).toBe(true);
      expect(looksLikePhone("+")).toBe(true);
    });

    it("returns true for strings starting with the current dial code", () => {
      expect(looksLikePhone("+91 8", "+91")).toBe(true);
    });

    it("returns false for usernames/emails", () => {
      expect(looksLikePhone("john.doe@example.com", "+1")).toBe(false);
      expect(looksLikePhone("user123", "+1")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(looksLikePhone("", "+1")).toBe(false);
    });
  });
});
