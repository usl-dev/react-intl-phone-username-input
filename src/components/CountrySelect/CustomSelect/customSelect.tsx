import React, { useId, useMemo } from "react";
import Flag from "@/components/Flag";
import LazyFlag from "@/components/Flag/LazyFlag";
import { CustomSelectProps } from "@/types/types";
import styles from "@/styles/customSelect.module.css";
import Arrow from "../Arrow";
import clsx from "clsx";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useCustomSelect } from "@/hooks/useCustomSelect";

const CustomSelect: React.FC<CustomSelectProps> = (props) => {
  const {
    moveKeyToTop,
    countryCode,
    handleChangeSelect,
    selectFieldName,
    showFlag,
    showDialCode,
    customArrowIcon,
    direction,
    enableSearch = true,
    searchPlaceholder,
    flagBaseUrl,
    className,
  } = props;

  const {
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
    handleKeyDown,
  } = useCustomSelect({
    countryCode,
    moveKeyToTop,
    enableSearch,
    handleChangeSelect,
    selectFieldName,
  });

  const ref = useClickOutside<HTMLDivElement>(handleClickOutside, isOpen);
  const listboxId = useId();
  const buttonId = useId();

  // Memoize the country list rendering to prevent unnecessary re-renders

  const renderCountryList = useMemo(
    () =>
      filteredCountries?.map((option, index) => (
        <li
          key={option?.value}
          className={clsx(
            styles["country-list-item"],
            className?.country_list_item
          )}
          role="presentation"
        >
          <button
            className={clsx(
              styles["country-option"],
              option?.value === countryCode && styles.selected,
              focusedIndex === index && styles.focused,
              className?.country_option
            )}
            value={option?.value}
            data-index={index}
            data-label={option?.label}
            data-dial-code={option?.dial_code}
            onClick={handleOptionClick}
            aria-selected={option?.value === countryCode}
            role="option"
            type="button"
            id={`${listboxId}-option-${index}`}
            tabIndex={isOpen ? 0 : -1}
          >
            {showFlag && (
              <LazyFlag
                countryCode={option?.value}
                label={option?.label}
                customSelect
                flagBaseUrl={flagBaseUrl}
                className={className?.list_flag}
                size="sm"
              />
            )}
            <span className={styles["country-name"]}>{option.label}</span>
            {showDialCode && (
              <span className={styles["dial-code"]}>{option?.dial_code}</span>
            )}
          </button>
        </li>
      )),
    [
      filteredCountries,
      countryCode,
      handleOptionClick,
      showFlag,
      className,
      listboxId,
      isOpen,
      showDialCode,
      focusedIndex,
      flagBaseUrl,
    ]
  );

  return (
    <div
      ref={ref}
      data-component="custom-select"
      className={clsx(
        styles["select-container"],
        direction === "rtl" && styles.rtl,
        className?.select_container
      )}
      dir={direction}
      onKeyDown={handleKeyDown}
    >
      {selectFieldName && (
        <input type="hidden" name={selectFieldName} value={countryCode} />
      )}
      <button
        id={buttonId}
        className={clsx(
          styles["select-overlay-btn"],
          className?.select_overlay_btn
        )}
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={`Select country, currently ${
          filteredCountries.find((c) => c.value === countryCode)?.label ||
          countryCode
        }`}
      >
        <Flag
          countryCode={countryCode}
          label={moveKeyToTop.find((c) => c.value === countryCode)?.label}
          flagBaseUrl={flagBaseUrl}
          className={className?.flag}
          size="sm"
        />
        <Arrow
          customSelect={isOpen}
          customArrowIcon={customArrowIcon}
          className={className?.arrow}
        />
      </button>
      <div
        className={clsx(
          styles["dropdown-container"],
          isOpen ? styles["dropdown-open"] : styles["dropdown-closed"],
          className?.dropdown_container
        )}
        aria-hidden={!isOpen}
      >
        {enableSearch && (
          <input
            type="text"
            placeholder={searchPlaceholder}
            className={clsx(styles["search-input"], className?.search_input)}
            value={searchQuery}
            onChange={handleSearchChange}
            ref={searchInputRef}
            aria-label="Search countries"
          />
        )}
        <ul
          id={listboxId}
          ref={listRef}
          className={clsx(styles["country-list"], className?.country_list)}
          role="listbox"
          aria-labelledby={buttonId}
        >
          {renderCountryList}
        </ul>
      </div>
    </div>
  );
};

// Simplified memo comparison for better performance
export default React.memo(CustomSelect, (prevProps, nextProps) => {
  return (
    prevProps.countryCode === nextProps.countryCode &&
    prevProps.handleChangeSelect === nextProps.handleChangeSelect &&
    prevProps.selectFieldName === nextProps.selectFieldName &&
    prevProps.showFlag === nextProps.showFlag &&
    prevProps.showDialCode === nextProps.showDialCode &&
    prevProps.direction === nextProps.direction &&
    prevProps.enableSearch === nextProps.enableSearch &&
    prevProps.searchPlaceholder === nextProps.searchPlaceholder &&
    prevProps.flagBaseUrl === nextProps.flagBaseUrl &&
    // Only check reference equality for complex objects
    prevProps.moveKeyToTop === nextProps.moveKeyToTop &&
    prevProps.className === nextProps.className &&
    prevProps.customArrowIcon === nextProps.customArrowIcon
  );
});
