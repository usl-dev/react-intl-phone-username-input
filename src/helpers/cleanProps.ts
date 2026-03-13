/** Props we never forward (handled by the component or invalid for input). */
const PROPS_TO_OMIT = new Set([
  "min",
  "max",
  "type",
  "value",
  "onChange",
  "options",
  "selectFieldName",
  "onChangeSelect",
  "mode",
  "format",
  "defaultCountry",
  "multiCountry",
  "enableFlag",
  "customSelect",
  "preferredCountries",
  "highlightCountries",
  "customArrowIcon",
  "direction",
  "enforceCustomSelect",
  "enforceHtmlSelect",
  "classes",
  "hideDialCode",
]);

export function cleanProps<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, v]) => {
      if (v === undefined) return false;
      if (PROPS_TO_OMIT.has(key)) return false;
      return true;
    })
  ) as Partial<T>;
}
