import {
  COUNTRY_SELECT_TYPE,
  CUSTOM_SELECT,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_FLAG_BASE_URL,
  DEFAULT_MODE,
  ENABLE_FLAG,
  FORMAT,
  HIDE_DIAL_CODE,
  MULTICUNTRY,
} from "@/assets/constants";
import { Options } from "@/types/types";
import { isSupportedCountry } from "libphonenumber-js";

const normalizeCountryCodes = (codes?: string[]) =>
  Array.from(
    new Set(
      (codes ?? [])
        .map((code) => code.trim().toUpperCase())
        .filter((code) => isSupportedCountry(code))
    )
  );

export function getValidOptions(options: Partial<Options> = {}): Options {
  const {
    mode,
    format,
    enableFlag,
    customSelect,
    multiCountry,
    defaultCountry,
    preferredCountries,
    highlightCountries,
    customArrowIcon,
    direction,
    enforceHtmlSelect,
    enforceCustomSelect,
    flagBaseUrl,
    classes,
    hideDialCode,
    ...rest
  } = options;

  const normalizedPreferredCountries = normalizeCountryCodes(preferredCountries);
  const normalizedHighlightCountries = normalizeCountryCodes(highlightCountries);
  const normalizedDefaultCountry = defaultCountry?.trim().toUpperCase();
  const resolvedDefaultCountry =
    normalizedDefaultCountry && isSupportedCountry(normalizedDefaultCountry)
      ? normalizedDefaultCountry
      : normalizedPreferredCountries[0] ?? DEFAULT_COUNTRY_CODE;

  return {
    mode: mode === "phone" || mode === "hybrid" ? mode : DEFAULT_MODE,
    format: format !== undefined ? format : FORMAT,
    enableFlag: enableFlag !== undefined ? enableFlag : ENABLE_FLAG,
    customSelect: {
      showFlag:
        customSelect?.showFlag !== undefined
          ? customSelect.showFlag
          : CUSTOM_SELECT.showFlag,
      showDialCode:
        customSelect?.showDialCode !== undefined
          ? customSelect.showDialCode
          : CUSTOM_SELECT.showDialCode,
      enableSearch:
        customSelect?.enableSearch !== undefined
          ? customSelect.enableSearch
          : CUSTOM_SELECT.enableSearch,
      searchPlaceholder:
        customSelect?.searchPlaceholder || CUSTOM_SELECT.searchPlaceholder,
    },
    multiCountry: multiCountry !== undefined ? multiCountry : MULTICUNTRY,
    defaultCountry: resolvedDefaultCountry,
    preferredCountries: normalizedPreferredCountries,
    highlightCountries: normalizedHighlightCountries,
    customArrowIcon: customArrowIcon || undefined,
    direction: direction === "rtl" ? "rtl" : "ltr",
    enforceHtmlSelect:
      enforceHtmlSelect !== undefined
        ? enforceHtmlSelect
        : COUNTRY_SELECT_TYPE === "native",
    enforceCustomSelect:
      enforceCustomSelect !== undefined
        ? enforceCustomSelect
        : COUNTRY_SELECT_TYPE !== "native",
    flagBaseUrl:
      flagBaseUrl !== undefined ? flagBaseUrl : DEFAULT_FLAG_BASE_URL,
    classes: classes || {},
    hideDialCode: hideDialCode !== undefined ? hideDialCode : HIDE_DIAL_CODE,
    ...rest,
  };
}
