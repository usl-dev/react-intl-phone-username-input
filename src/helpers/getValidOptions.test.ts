import { describe, expect, it } from "vitest";
import { getValidOptions } from "./getValidOptions";

describe("getValidOptions", () => {
  it("normalizes country lists and falls back to the first preferred country", () => {
    const options = getValidOptions({
      preferredCountries: ["us", "IN", "zz", "us"],
      highlightCountries: ["ae", "xx", "AE"],
    });

    expect(options.defaultCountry).toBe("US");
    expect(options.preferredCountries).toEqual(["US", "IN"]);
    expect(options.highlightCountries).toEqual(["AE"]);
  });

  it("falls back to the first valid preferred country when defaultCountry is invalid", () => {
    const options = getValidOptions({
      defaultCountry: "xx",
      preferredCountries: ["qa", "ae"],
    });

    expect(options.defaultCountry).toBe("QA");
  });
});
