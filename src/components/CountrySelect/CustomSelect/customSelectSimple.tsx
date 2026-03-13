import Flag from "@/components/Flag";
import { CustomSelectProps } from "@/types/types";
import styles from "@/styles/customSelect.module.css";
import Arrow from "../Arrow";
import clsx from "clsx";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useCustomSelect } from "@/hooks/useCustomSelect";

const CustomSelectSimple: React.FC<CustomSelectProps> = (props) => {
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

  const renderCountryList = () =>
    filteredCountries?.map((option) => (
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
            className?.country_option
          )}
          value={option?.value}
          data-label={option?.label}
          data-dial-code={option?.dial_code}
          onClick={handleOptionClick}
          aria-selected={option?.value === countryCode}
          role="option"
          type="button"
        >
          {/* No flag in dropdown for performance - just text */}
          <span className={styles["country-name"]}>{option.label}</span>
          {showDialCode && (
            <span className={styles["dial-code"]}>{option?.dial_code}</span>
          )}
        </button>
      </li>
    ));

  return (
    <div
      ref={ref}
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
        className={clsx(
          styles["select-overlay-btn"],
          className?.select_overlay_btn
        )}
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Keep flag only in the button */}
        <Flag
          countryCode={countryCode}
          flagBaseUrl={flagBaseUrl}
          className={className?.flag}
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
            tabIndex={isOpen ? 0 : -1}
          />
        )}
        <ul
          ref={listRef}
          className={clsx(styles["country-list"], className?.country_list)}
          role="listbox"
        >
          {renderCountryList()}
        </ul>
      </div>
    </div>
  );
};

export default CustomSelectSimple;
