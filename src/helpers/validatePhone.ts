import {
  isValidPhoneNumber,
  isPossiblePhoneNumber,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js";
import type { PhoneValidityState } from "@/types/types";

/**
 * Validates a phone number string and returns a structured validity state.
 *
 * @param value - The phone number to validate (e.g. "+1 650 253 0000").
 * @param countryCode - Optional ISO 3166-1 alpha-2 country code hint (e.g. "US").
 *   Improves accuracy for numbers without a leading "+" dial code.
 *
 * @returns A {@link PhoneValidityState} object:
 *   - `status`: `"valid"` | `"too_short"` | `"too_long"` | `"invalid"` | `"unknown"`
 *   - `isValid`: `true` only when the number is fully valid
 *   - `isPossible`: `true` when the number could become valid with more digits
 *
 * @example
 * ```ts
 * import { validatePhone } from 'react-intl-phone-username-input';
 *
 * validatePhone("+1 650 253 0000");
 * // { status: "valid", isValid: true, isPossible: true }
 *
 * validatePhone("+1 650");
 * // { status: "too_short", isValid: false, isPossible: true }
 *
 * // Zod integration:
 * const phoneSchema = z.string().refine(
 *   (v) => validatePhone(v).isValid,
 *   { message: "Invalid phone number" }
 * );
 * ```
 */
export function validatePhone(
  value: string,
  countryCode?: string,
): PhoneValidityState {
  if (!value || value.trim() === "") {
    return { status: "unknown", isValid: false, isPossible: false };
  }

  try {
    const cc = countryCode as CountryCode | undefined;
    const lengthResult = validatePhoneNumberLength(value, cc);

    if (lengthResult === "TOO_SHORT") {
      return { status: "too_short", isValid: false, isPossible: true };
    }
    if (lengthResult === "TOO_LONG") {
      return { status: "too_long", isValid: false, isPossible: false };
    }
    if (lengthResult === "INVALID_COUNTRY") {
      return { status: "invalid", isValid: false, isPossible: false };
    }

    if (isValidPhoneNumber(value, cc)) {
      return { status: "valid", isValid: true, isPossible: true };
    }

    const possible = isPossiblePhoneNumber(value, cc);
    return { status: "invalid", isValid: false, isPossible: possible };
  } catch {
    return { status: "unknown", isValid: false, isPossible: false };
  }
}
