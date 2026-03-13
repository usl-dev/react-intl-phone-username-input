import { DEFAULT_FLAG_BASE_URL } from "@/assets/constants";

export const getFlag = (
  countryCode: string | undefined,
  flagBaseUrl: string = DEFAULT_FLAG_BASE_URL
): string | undefined => {
  if (!countryCode) return undefined;

  try {
    const normalizedBaseUrl = flagBaseUrl.endsWith("/")
      ? flagBaseUrl.slice(0, -1)
      : flagBaseUrl;
    return `${normalizedBaseUrl}/${countryCode.toLowerCase()}.svg`;
  } catch {
    return undefined;
  }
};
