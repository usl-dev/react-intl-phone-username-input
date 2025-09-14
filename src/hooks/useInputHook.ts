import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import { NUMBER_REGEX, NUMBER_REGEX_WITH_PLUS } from "@/assets/constants";
import { countryList } from "@/assets/countryList";
import {
  getPhoneNoLength,
  formatPhoneWithDialCode,
  looksLikePhoneNumber,
  extractDigits,
} from "@/helpers/phoneNumberUtil";
import {
  ClickEvent,
  CountryState,
  ExtendedOptions,
  InputEvent,
  SelectEvent,
  UseInputHookReturn,
} from "@/types/types";
import { buildCountryMap, getMovedCountries } from "@/helpers/helpers";

// Cache country map globally to avoid recreation with better memory management
let globalCountryMap: Record<string, any> | null = null;

const useInputHook = (props: ExtendedOptions): UseInputHookReturn => {
  // Destructure props for clarity
  const {
    mode,
    multiCountry,
    defaultCountry,
    highLightCountries,
    preferredCountries,
    value,
    onChange,
    format,
    onChangeSelect,
    hideDialCode,
  } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const mobileNumberOnly: boolean = mode === "phone";

  // Use global cached country map or create once
  const countryMap = useMemo(() => {
    if (!globalCountryMap) {
      globalCountryMap = buildCountryMap();
    }
    return globalCountryMap;
  }, []);

  // Memoize default country code, dial code, and flag for performance
  const defaultCode: string = useMemo(
    () => defaultCountry ?? preferredCountries?.[0],
    [defaultCountry, preferredCountries]
  );
  const defaultDialCode: string = useMemo(
    () => countryMap[defaultCode]?.dial_code,
    [countryMap, defaultCode]
  );
  const defaultFlag: string = useMemo(
    () => countryMap[defaultCode]?.image,
    [countryMap, defaultCode]
  );

  // Initialize state with fallback values to ensure consistency
  const [countryDetails, setCountryDetails] = useState<CountryState>(() => ({
    presentDialCode: defaultDialCode,
    code: defaultCode,
    flag: defaultFlag,
  }));

  // Memoize input value calculation
  const inputValue: string = useMemo(() => {
    if (hideDialCode) {
      // When hideDialCode is true, don't show dial code in input
      return value ? value : "";
    }
    const defaultUsername = mobileNumberOnly ? `${defaultDialCode} ` : "";
    return value ? value : defaultUsername;
  }, [value, mobileNumberOnly, defaultDialCode, hideDialCode]);

  // Memoize number validation
  const { isNumber, phoneNumber, dialCodeLength } = useMemo(() => {
    const isNum = mobileNumberOnly
      ? true
      : NUMBER_REGEX_WITH_PLUS.test(inputValue);
    const phoneNum = isNum ? parsePhoneNumberFromString(inputValue) : undefined;
    const dialLength = countryDetails?.presentDialCode?.length + 1;
    return {
      isNumber: isNum,
      phoneNumber: phoneNum,
      dialCodeLength: dialLength,
    };
  }, [mobileNumberOnly, inputValue, countryDetails?.presentDialCode]);

  const { number = "" } = phoneNumber || {};

  const hasNumberExceptDialCode = mobileNumberOnly
    ? true
    : NUMBER_REGEX.test(number);

  // Use useCallback for setCountryDetails in useEffect to avoid unnecessary re-renders
  const updateCountryDetails = useCallback(
    (code: string) => {
      setCountryDetails({
        presentDialCode: countryMap[code]?.dial_code,
        code,
        flag: countryMap[code]?.image,
      });
    },
    [countryMap]
  );

  useEffect(() => {
    if (defaultCode !== countryDetails.code) {
      updateCountryDetails(defaultCode);
    }
  }, [defaultCode, countryDetails.code, updateCountryDetails]);

  const { max } = useMemo(
    () => getPhoneNoLength(isNumber, countryDetails?.code),
    [isNumber, countryDetails?.code]
  );

  // Optimized input change handler with memoization
  const handleInputChange = useCallback(
    (e: InputEvent) => {
      const newValue = (e.target as HTMLInputElement).value;

      if (mobileNumberOnly) {
        // Handle phone-only mode
        if (hideDialCode) {
          // When hideDialCode is true, handle input without dial code prefix
          const cleanedNumber = extractDigits(newValue);
          const limitedNumber =
            max && cleanedNumber.length > max
              ? cleanedNumber.slice(0, max)
              : cleanedNumber;

          // Format without dial code but keep internal tracking
          if (format && limitedNumber) {
            const asYouType = new AsYouType(countryDetails?.code as any);
            const formatted = asYouType.input(limitedNumber);
            onChange(formatted.replace(/^\+\d+\s*/, ""));
          } else {
            onChange(limitedNumber);
          }
          return;
        }

        const dialCodeWithSpace = `${countryDetails?.presentDialCode} `;

        // Handle backspace: if user deletes space after dial code, restore it
        if (newValue === countryDetails?.presentDialCode) {
          onChange(dialCodeWithSpace);
          return;
        }

        // If input doesn't start with dial code, extract only digits and add dial code
        let numberPart = "";
        if (newValue.startsWith(dialCodeWithSpace)) {
          numberPart = newValue.slice(dialCodeWithSpace.length);
        } else if (newValue.startsWith(countryDetails?.presentDialCode)) {
          // Handle case where space is missing (like when user deletes it)
          numberPart = newValue.slice(countryDetails?.presentDialCode.length);
        } else {
          // Extract digits from the entire input
          numberPart = newValue.replace(/^[^\d]*/, "");
        }

        const cleanedNumber = extractDigits(numberPart);
        const limitedNumber =
          max && cleanedNumber.length > max
            ? cleanedNumber.slice(0, max)
            : cleanedNumber;

        const formattedNumber = formatPhoneWithDialCode(
          limitedNumber,
          countryDetails?.presentDialCode,
          format,
          countryDetails?.code
        );

        onChange(formattedNumber);
        return;
      }

      // Handle hybrid mode (text + phone number support)
      const dialCodeWithSpace = `${countryDetails?.presentDialCode} `;

      // Enhanced logic for hybrid mode
      // Check if input contains letters (indicating text mode)
      const hasLetters = /[a-zA-Z]/.test(newValue);

      // Check if it looks like phone but also consider if it has letters mixed in
      const startsWithDialCode =
        newValue.startsWith(dialCodeWithSpace) ||
        newValue.startsWith(countryDetails?.presentDialCode);
      const looksPhoneNumber = looksLikePhoneNumber(newValue);

      // If it has letters and starts with dial code, it might be transitioning from phone to text
      if (hasLetters && startsWithDialCode) {
        // Remove dial code and treat as text, also remove any formatting spaces
        const withoutDialCode = newValue.startsWith(dialCodeWithSpace)
          ? newValue.slice(dialCodeWithSpace.length)
          : newValue.slice(countryDetails?.presentDialCode.length);
        // Remove any remaining spaces from the text portion
        const cleanText = withoutDialCode.replace(/\s+/g, "");
        onChange(cleanText);
        return;
      }

      // If it has letters anywhere, treat as text and remove formatting spaces
      if (hasLetters) {
        // Check if this was previously a formatted phone number
        // If so, remove all spaces to make it plain text
        const cleanText = newValue.replace(/\s+/g, "");
        onChange(cleanText);
        return;
      }

      // Handle phone number input
      if (looksPhoneNumber || startsWithDialCode) {
        // In hybrid mode, allow complete deletion of dial code
        // If user deletes everything (including dial code), allow it
        if (newValue === "") {
          onChange("");
          return;
        }

        // In hybrid mode, if user deletes space after dial code but there are no digits,
        // check if they're trying to delete the dial code entirely
        if (newValue === countryDetails?.presentDialCode) {
          // Check if there's any number content that would suggest keeping the dial code
          // In hybrid mode, we allow complete deletion, so don't auto-restore
          // Let it be handled as empty or text input
          onChange("");
          return;
        }

        let numberPart = "";
        if (newValue.startsWith(dialCodeWithSpace)) {
          numberPart = newValue.slice(dialCodeWithSpace.length);
        } else if (newValue.startsWith(countryDetails?.presentDialCode)) {
          // Handle case where space is missing
          numberPart = newValue.slice(countryDetails?.presentDialCode.length);
        } else {
          // For inputs that look like phone numbers but don't start with dial code
          numberPart = newValue;
        }

        const cleanedNumber = extractDigits(numberPart);

        // If no digits and input is shorter than dial code, treat as text/empty
        if (
          !cleanedNumber &&
          newValue.length < countryDetails?.presentDialCode.length
        ) {
          onChange(newValue);
          return;
        }

        const limitedNumber =
          max && cleanedNumber.length > max
            ? cleanedNumber.slice(0, max)
            : cleanedNumber;

        // Format the phone number using utility function
        const formattedNumber = formatPhoneWithDialCode(
          limitedNumber,
          countryDetails?.presentDialCode,
          format,
          countryDetails?.code
        );

        onChange(formattedNumber);
      } else {
        // Handle as regular text input (username/email)
        onChange(newValue);
      }
    },
    [
      onChange,
      mobileNumberOnly,
      countryDetails?.presentDialCode,
      countryDetails?.code,
      max,
      format,
    ]
  );

  const handleChangeSelect = useCallback(
    (e: SelectEvent) => {
      if (multiCountry) {
        const value = e.target.value;
        const dialCode =
          e.target.selectedOptions?.[0]?.getAttribute("data-dial-code") ?? "";
        const flag = countryMap[value]?.image ?? "";

        // Force immediate synchronous update for instant UI feedback
        setCountryDetails({
          code: value,
          presentDialCode: dialCode,
          flag,
        });

        // Then update input value based on new country
        const newDialCodeWithSpace = `${dialCode} `;
        if (!hideDialCode) {
          onChange(newDialCodeWithSpace);
        }

        // Focus input after state updates
        setTimeout(() => {
          const input = inputRef.current;
          if (input) {
            input.focus();
            // Place cursor at the end of the dial code
            const pos = newDialCodeWithSpace.length;
            input.setSelectionRange(pos, pos);
          }
        }, 0);

        if (onChangeSelect) onChangeSelect(e);
      }
    },
    [multiCountry, countryMap, onChange, onChangeSelect, hideDialCode]
  );

  const handleClick = useCallback(
    (e: ClickEvent) => {
      if (!hasNumberExceptDialCode) return;

      const inputEl = e.target as HTMLInputElement;
      const startPos = inputEl.selectionStart ?? 0;

      if (startPos < dialCodeLength) {
        e.preventDefault();
        inputRef.current?.setSelectionRange(
          inputEl.value.length,
          inputEl.value.length
        );
      }
    },
    [hasNumberExceptDialCode, dialCodeLength]
  );

  // Memoize moved countries calculation
  const moveKeyToTop = useMemo(
    () =>
      getMovedCountries(
        countryList,
        countryMap,
        highLightCountries,
        preferredCountries
      ),
    [countryMap, highLightCountries, preferredCountries]
  );

  return {
    countryDetails,
    inputRef,
    handleInputChange,
    handleChangeSelect,
    handleClick,
    moveKeyToTop,
    inputValue,
    isNumber,
  };
};

export default useInputHook;
