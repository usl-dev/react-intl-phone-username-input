import { Country } from "@/types/types";

/**
 * Builds a map of countries, keyed by their ISO 3166-1 alpha-2 code.
 * @param list - List of countries to build the map from.
 */
export const buildCountryMap = (list: Country[]): Record<string, Country> => {
  return list?.reduce((acc, country) => {
    acc[country?.value] = country;
    return acc;
  }, {} as Record<string, Country>);
};

/**
 * Return an array of countries that are moved to the top of the list.
 * Countries with `highlight` are moved first, followed by countries with
 * `preferred` codes. If `preferred` is empty, all countries are moved.
 */

export const getMovedCountries = (
  countryList: Country[],
  countryMap: Record<string, Country>,
  highlight?: string[],
  preferred?: string[]
): Country[] => {
  const highlightSet = new Set(highlight);
  const preferredSet = new Set(preferred);

  // Case 1: Only preferred is given
  if (preferred?.length && !highlight?.length) {
    const preferredCountries = preferred
      .map((code) => countryMap[code])
      .filter(Boolean) as Country[];

    const rest = countryList.filter((country) => !preferredSet.has(country.value));

    return [...preferredCountries, ...rest];
  }

  // Case 2: Highlight is given
  if (highlight?.length) {
    const highlighted = highlight
      .map((code) => countryMap[code])
      .filter(Boolean) as Country[];

    let rest: Country[];

    if (preferred?.length) {
      const preferredCountries = preferred
        .filter((code) => !highlightSet.has(code))
        .map((code) => countryMap[code])
        .filter(Boolean) as Country[];

      const excludedCodes = new Set([
        ...highlightSet,
        ...preferredCountries.map((country) => country.value),
      ]);

      rest = [
        ...preferredCountries,
        ...countryList.filter((country) => !excludedCodes.has(country.value)),
      ];
    } else {
      // Use full list if no preferred
      rest = countryList.filter((c) => !highlightSet.has(c.value));
    }

    return [...highlighted, ...rest];
  }

  // Case 3: Neither preferred nor highlight is given
  return countryList;
};
