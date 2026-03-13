import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { BtnClickEvent, CountrySelectChange } from "@/types/types";

type CountryOption = {
  label: string;
  value: string;
  dial_code?: string;
  [k: string]: any;
};

interface UseCustomSelectProps {
  countryCode: string;
  moveKeyToTop: CountryOption[];
  enableSearch: boolean;
  handleChangeSelect: (change: CountrySelectChange) => void;
  selectFieldName?: string;
}

export const useCustomSelect = ({
  countryCode,
  moveKeyToTop,
  enableSearch,
  handleChangeSelect,
  selectFieldName,
}: UseCustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const listRef = useRef<HTMLUListElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const focusedIndexRef = useRef<number>(-1);

  // keep ref synced so document listener can read latest value
  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  const resetState = useCallback(() => {
    setSearchQuery("");
    setFocusedIndex(-1);
  }, []);

  const filteredCountries = useMemo<CountryOption[]>(() => {
    if (!moveKeyToTop) return [];
    if (!enableSearch || !searchQuery) return moveKeyToTop;
    const q = searchQuery.toLowerCase();
    return moveKeyToTop.filter(
      (opt) =>
        opt?.label?.toLowerCase().includes(q) ||
        String(opt?.dial_code ?? "").includes(searchQuery)
    );
  }, [moveKeyToTop, searchQuery, enableSearch]);

  const scrollIntoIndex = useCallback((idx: number) => {
    if (!listRef.current || idx < 0) return;
    // Prefer explicit data-index if present in your rendered button,
    // otherwise fall back to nth-of-type.
    const el =
      listRef.current.querySelector<HTMLButtonElement>(
        `button[data-index="${idx}"]`
      ) ||
      listRef.current.querySelector<HTMLButtonElement>(
        `button:nth-of-type(${idx + 1})`
      );
    if (el) {
      el.focus();
      // scrollIntoView synchronously to keep UX snappy
      if (typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, []);

  // central selection handler
  const selectCountry = useCallback(
    (country: CountryOption) => {
      setIsOpen(false);
      resetState();
      handleChangeSelect({
        countryCode: country.value,
        dialCode: country.dial_code ?? "",
        label: country.label,
        name: selectFieldName,
        source: "custom-select",
      });
    },
    [handleChangeSelect, resetState, selectFieldName]
  );

  // Toggle dropdown (keeps immediate scroll to selected)
  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        // compute initial focused index when opening
        const idx = filteredCountries.findIndex((c) => c.value === countryCode);
        // if search enabled, keep -1 so input remains primary; otherwise pre-focus selected
        setFocusedIndex(enableSearch ? -1 : idx >= 0 ? idx : 0);
        // small delay may not be necessary; scroll selected immediately
        setTimeout(() => {
          if (!enableSearch)
            scrollIntoIndex(enableSearch ? -1 : idx >= 0 ? idx : 0);
        }, 0);
        // manage focus (search input or selected button)
        if (enableSearch && searchInputRef.current) {
          searchInputRef.current.focus();
        } else {
          // focus handled by scrollIntoIndex above
        }
      } else {
        resetState();
      }
      return next;
    });
  }, [
    countryCode,
    enableSearch,
    filteredCountries,
    resetState,
    scrollIntoIndex,
  ]);

  // click option (button)
  const handleOptionClick = useCallback(
    (e: BtnClickEvent) => {
      const value = e.currentTarget.value;
      const dialCode = e.currentTarget.getAttribute("data-dial-code") ?? "";
      // find country in the list (fallback)
      const country = filteredCountries.find((c) => c.value === value) ?? {
        value,
        dial_code: dialCode,
        label: value,
      };
      selectCountry(country);
    },
    [filteredCountries, selectCountry]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setFocusedIndex(-1);
    },
    []
  );

  // React-style keydown handler (optional to attach to a container)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      // allow the document listener to do the heavy lifting; keep this for local usage
      const key = e.key;
      if (key === "ArrowDown" || key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const max = filteredCountries.length - 1;
          const next =
            key === "ArrowDown"
              ? prev < max
                ? prev + 1
                : 0
              : prev > 0
              ? prev - 1
              : max;
          return next;
        });
      } else if (key === "Enter") {
        e.preventDefault();
        const idx = focusedIndexRef.current;
        if (idx >= 0 && filteredCountries[idx])
          selectCountry(filteredCountries[idx]);
      } else if (key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        resetState();
      }
    },
    [isOpen, filteredCountries, selectCountry, resetState]
  );

  // whenever focusedIndex changes, focus and scroll that item into view
  useEffect(() => {
    if (focusedIndex >= 0) {
      // small timeout to allow DOM children to be present (safe)
      setTimeout(() => scrollIntoIndex(focusedIndex), 0);
    }
  }, [focusedIndex, scrollIntoIndex]);

  // when filteredCountries changes while open, ensure focusedIndex remains valid
  useEffect(() => {
    if (!isOpen) return;
    if (filteredCountries.length === 0) {
      setFocusedIndex(-1);
      return;
    }
    setFocusedIndex((prev) => {
      if (prev === -1 && !enableSearch) {
        // default to first option if nothing focused and no search input
        return 0;
      }
      if (prev >= filteredCountries.length) return filteredCountries.length - 1;
      return prev;
    });
  }, [filteredCountries, isOpen, enableSearch]);

  const handleClickOutside = useCallback(() => {
    setIsOpen(false);
    resetState();
  }, [resetState]);

  return {
    isOpen,
    searchQuery,
    filteredCountries,
    focusedIndex,
    listRef,
    searchInputRef,
    toggleDropdown,
    handleOptionClick,
    handleSearchChange,
    handleClickOutside,
    handleKeyDown, // optional: attach to a container if you prefer not to rely on document listener
  };
};
