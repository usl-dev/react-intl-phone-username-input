import {
  AsYouType,
  getExampleNumber,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import { formatPhoneWithDialCode } from "./phoneNumberUtil";

export type PhoneInputLimits = {
  maxLength: number;
  minLength: number;
};

/**
 * Get the maxLength for a formatted phone input (international format via AsYouType).
 * This returns the "clean" AsYouType length, useful as a standalone utility.
 */
export function getFormattedMaxLength(countryCode: string): number | null {
  const example = getExampleNumber(countryCode as CountryCode, examples);
  if (!example) return null;

  const formatter = new AsYouType(countryCode as CountryCode);
  const formatted = formatter.input(example.formatInternational());
  return formatted.length;
}

/**
 * Get the maxLength for an unformatted phone input (digits + "+" only).
 */
export function getUnformattedMaxLength(countryCode: string): number | null {
  const example = getExampleNumber(countryCode as CountryCode, examples);
  if (!example) return null;

  const unformatted = "+" + example.countryCallingCode + example.nationalNumber;
  return unformatted.length;
}

/**
 * Find the minimum valid national number length for a country.
 * Iterates from 4 digits upward until validatePhoneNumberLength
 * does not return "TOO_SHORT".
 */
function getMinNationalLength(countryCode: string): number | null {
  const example = getExampleNumber(countryCode as CountryCode, examples);
  if (!example) return null;

  const maxLen = example.nationalNumber.length;
  const callingCode = example.countryCallingCode;

  for (let len = 4; len <= maxLen; len++) {
    // Build a test number using leading digits from the example
    const testDigits = example.nationalNumber.substring(0, len);
    const testNumber = `+${callingCode}${testDigits}`;
    const result = validatePhoneNumberLength(
      testNumber,
      countryCode as CountryCode
    );
    if (result !== "TOO_SHORT") {
      return len;
    }
  }

  return maxLen;
}

/**
 * Get phone input limits that match the component's actual formatting output.
 *
 * Uses `formatPhoneWithDialCode` internally so the maxLength is always
 * consistent with what the component stores as the input value.
 *
 * @returns `{ maxLength, minLength }` or `null` if the country is unknown.
 */
export function getPhoneInputLimits(
  countryCode: string,
  format: boolean,
  hideDialCode: boolean
): PhoneInputLimits | null {
  const example = getExampleNumber(countryCode as CountryCode, examples);
  if (!example) return null;

  const dialCode = "+" + example.countryCallingCode;
  const nationalNumber = example.nationalNumber;
  const maxNationalLen = nationalNumber.length;
  const minNationalLen = getMinNationalLength(countryCode) ?? maxNationalLen;

  if (hideDialCode) {
    if (format) {
      // Simulate component behavior: AsYouType(country).input(nationalDigits)
      // then strip the international prefix that AsYouType may prepend.
      const asYouType = new AsYouType(countryCode as CountryCode);
      const formatted = asYouType.input(nationalNumber);
      const national = formatted.replace(/^\+\d+\s*/, "");
      const maxLength = national.length;

      const minAsYouType = new AsYouType(countryCode as CountryCode);
      const minFormatted = minAsYouType.input(
        nationalNumber.substring(0, minNationalLen)
      );
      const minNational = minFormatted.replace(/^\+\d+\s*/, "");
      const minLength = minNational.length;

      return { maxLength, minLength };
    }
    // Unformatted + hideDialCode → raw national digits only
    return {
      maxLength: maxNationalLen,
      minLength: minNationalLen,
    };
  }

  // hideDialCode = false
  if (format) {
    // Use the same formatter the component uses so lengths always match.
    const maxValue = formatPhoneWithDialCode(
      nationalNumber,
      dialCode,
      true,
      countryCode
    );
    const minValue = formatPhoneWithDialCode(
      nationalNumber.substring(0, minNationalLen),
      dialCode,
      true,
      countryCode
    );
    return { maxLength: maxValue.length, minLength: minValue.length };
  }

  // Unformatted: component stores "${dialCode} ${digits}"
  return {
    maxLength: dialCode.length + 1 + maxNationalLen,
    minLength: dialCode.length + 1 + minNationalLen,
  };
}

/**
 * Check whether a value looks like a phone number.
 */
export function looksLikePhone(value: string, dialCode?: string): boolean {
  if (!value) return false;
  if (value.startsWith("+")) return true;
  if (dialCode && value.startsWith(dialCode)) return true;
  return false;
}

/**
 * Sanitize a phone input value to enforce length limits.
 *
 * @param newValue  - The candidate value after formatting.
 * @param oldValue  - The previous input value (returned on block).
 * @param limits    - Current phone limits (null = no restriction).
 * @param isPaste   - `true` when the change originated from a paste event.
 *
 * - Empty or within-limit values are always allowed.
 * - On normal typing that exceeds maxLength → block (return oldValue).
 * - On paste that exceeds maxLength → trim to maxLength.
 */
export function sanitizePhoneInput(
  newValue: string,
  oldValue: string,
  limits: PhoneInputLimits | null,
  isPaste: boolean = false
): string {
  if (!limits) return newValue;
  if (newValue === "") return newValue;
  if (newValue.length <= limits.maxLength) return newValue;

  // Over limit
  if (isPaste) {
    return newValue.substring(0, limits.maxLength);
  }
  return oldValue;
}
