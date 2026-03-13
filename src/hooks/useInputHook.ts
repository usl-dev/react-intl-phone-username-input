import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { AsYouType, CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { NUMBER_REGEX, NUMBER_REGEX_WITH_PLUS, DEFAULT_COUNTRY_CODE } from "@/assets/constants";
import { minimalCountryList } from "@/assets/minimalCountryList";
import {
  formatPhoneWithDialCode,
  looksLikePhoneNumber,
  extractDigits,
} from "@/helpers/phoneNumberUtil";
import {
  ClickEvent,
  CountrySelectChange,
  CountryState,
  ExtendedOptions,
  InputEvent,
  UseInputHookReturn,
} from "@/types/types";
import { buildCountryMap, getMovedCountries } from "@/helpers/helpers";
import type { Country } from "@/types/types";

const useInputHook = (props: ExtendedOptions): UseInputHookReturn => {
  const {
    mode,
    multiCountry,
    defaultCountry,
    highlightCountries,
    preferredCountries,
    value,
    onChange,
    format,
    onChangeSelect,
    hideDialCode,
    selectFieldName,
  } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const mountedRef = useRef(true);
  const mobileNumberOnly: boolean = mode === "phone";

  // Lazy-load full country list; use minimal list until loaded
  const [fullCountryList, setFullCountryList] = useState<Country[] | null>(
    null
  );
  useEffect(() => {
    import("@/assets/countryList").then((m) => setFullCountryList(m.countryList));
  }, []);

  const listToUse = fullCountryList ?? minimalCountryList;
  const countryMap = useMemo(
    () => buildCountryMap(listToUse),
    [listToUse]
  );

  // Calculate default values
  const defaultCode: string =
    defaultCountry ?? preferredCountries?.[0] ?? DEFAULT_COUNTRY_CODE;
  const defaultDialCode: string = countryMap[defaultCode]?.dial_code ?? "";
  const defaultLabel: string = countryMap[defaultCode]?.label ?? "";

  // Initialize state with fallback values
  const [countryDetails, setCountryDetails] = useState<CountryState>(() => ({
    presentDialCode: defaultDialCode,
    code: defaultCode,
    label: defaultLabel,
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

  useEffect(() => {
    if (defaultCode !== countryDetails.code) {
      setCountryDetails({
        presentDialCode: countryMap[defaultCode]?.dial_code ?? "",
        code: defaultCode,
        label: countryMap[defaultCode]?.label ?? "",
      });
    }
  }, [defaultCode, countryMap]);

  // When full country list loads, update label for current code
  useEffect(() => {
    if (!fullCountryList) return;
    setCountryDetails((prev) => ({
      ...prev,
      label: countryMap[prev.code]?.label ?? prev.label,
    }));
  }, [fullCountryList, countryMap]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Optimized input change handler with memoization
  const handleInputChange = useCallback(
    (e: InputEvent) => {
      const newValue = (e.target as HTMLInputElement).value;

      if (mobileNumberOnly) {
        // Handle phone-only mode
        if (hideDialCode) {
          // When hideDialCode is true, handle input without dial code prefix
          const cleanedNumber = extractDigits(newValue);

          // Format without dial code but keep internal tracking
          if (format && cleanedNumber) {
            const asYouType = new AsYouType(
              countryDetails?.code as CountryCode | undefined
            );
            const formatted = asYouType.input(cleanedNumber);
            onChange(formatted.replace(/^\+\d+\s*/, ""));
          } else {
            onChange(cleanedNumber);
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

        const formattedNumber = formatPhoneWithDialCode(
          cleanedNumber,
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

        // Format the phone number using utility function
        const formattedNumber = formatPhoneWithDialCode(
          cleanedNumber,
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
      format,
      hideDialCode,
    ]
  );

  const handleChangeSelect = useCallback(
    (change: CountrySelectChange) => {
      if (multiCountry) {
        const {
          countryCode,
          dialCode,
          label,
          name,
          source,
        } = change;

        // Force immediate synchronous update for instant UI feedback
        setCountryDetails({
          code: countryCode,
          presentDialCode: dialCode,
          label: label ?? countryMap[countryCode]?.label ?? "",
        });

        // Then update input value based on new country
        const newDialCodeWithSpace = `${dialCode} `;
        if (!hideDialCode) {
          onChange(newDialCodeWithSpace);
        }

        // Focus input after state updates (guard against unmount)
        setTimeout(() => {
          if (!mountedRef.current) return;
          const input = inputRef.current;
          if (input && document.contains(input)) {
            input.focus();
            const pos = hideDialCode
              ? input.value.length
              : newDialCodeWithSpace.length;
            input.setSelectionRange(pos, pos);
          }
        }, 0);

        onChangeSelect?.({
          countryCode,
          dialCode,
          label: label ?? countryMap[countryCode]?.label ?? "",
          name: name ?? selectFieldName,
          source,
        });
      }
    },
    [
      multiCountry,
      countryMap,
      onChange,
      onChangeSelect,
      hideDialCode,
      selectFieldName,
    ]
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

  // Memoize moved countries from current list (minimal or full)
  const moveKeyToTop = useMemo(
    () =>
      getMovedCountries(
        listToUse,
        countryMap,
        highlightCountries,
        preferredCountries
      ),
    [listToUse, countryMap, highlightCountries, preferredCountries]
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
