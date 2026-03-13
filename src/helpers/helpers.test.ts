import { describe, expect, it } from "vitest";
import { buildCountryMap, getMovedCountries } from "./helpers";

const countryList = [
  { value: "IN", label: "India", dial_code: "+91", image: "" },
  { value: "US", label: "United States", dial_code: "+1", image: "" },
  { value: "GB", label: "United Kingdom", dial_code: "+44", image: "" },
  { value: "AE", label: "United Arab Emirates", dial_code: "+971", image: "" },
];

describe("getMovedCountries", () => {
  it("moves preferred countries to the top without filtering the rest", () => {
    const countryMap = buildCountryMap(countryList);

    expect(
      getMovedCountries(countryList, countryMap, [], ["US", "IN"]).map(
        (country) => country.value
      )
    ).toEqual(["US", "IN", "GB", "AE"]);
  });

  it("keeps highlights first, then preferred countries, then the remaining countries", () => {
    const countryMap = buildCountryMap(countryList);

    expect(
      getMovedCountries(countryList, countryMap, ["AE"], ["US", "IN"]).map(
        (country) => country.value
      )
    ).toEqual(["AE", "US", "IN", "GB"]);
  });
});
