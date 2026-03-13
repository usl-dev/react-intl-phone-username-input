import React, { memo } from "react";
import Flag from "@/components/Flag";
import styles from "@/styles/htmlSelect.module.css";
import Arrow from "../Arrow";
import clsx from "clsx";
import { CountrySelectChange, HtmlSelectProps } from "@/types/types";

const HtmlSelect: React.FC<HtmlSelectProps> = (props) => {
  const {
    moveKeyToTop,
    countryCode,
    handleChangeSelect,
    selectFieldName = "country_select",
    customArrowIcon,
    direction,
    flagBaseUrl,
    className,
  } = props;

  const handleNativeSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOption = e.target.selectedOptions?.[0];
    const change: CountrySelectChange = {
      countryCode: e.target.value,
      dialCode: selectedOption?.getAttribute("data-dial-code") ?? "",
      label: selectedOption?.getAttribute("data-label") ?? undefined,
      name: e.target.name,
      source: "native-select",
    };

    handleChangeSelect(change);
  };

  return (
    <div
      data-component="html-select"
      className={clsx(
        styles["select-container"],
        direction === "rtl" && styles["rtl"],
        className?.html_select_container
      )}
    >
      <div
        className={clsx(styles["select-wrapper"], className?.select_wrapper)}
      >
        <select
          name={selectFieldName}
          value={countryCode}
          onChange={handleNativeSelectChange}
          className={clsx(styles["select-overlay"], className?.select_overlay)}
        >
          {moveKeyToTop?.map((option) => (
            <option
              key={option?.value}
              value={option?.value}
              data-label={option?.label}
              data-dial-code={option?.dial_code}
            >
              {option?.label}
            </option>
          ))}
        </select>

        <Flag
          countryCode={countryCode}
          label={moveKeyToTop?.find((c) => c.value === countryCode)?.label}
          flagBaseUrl={flagBaseUrl}
          className={className?.flag}
        />
        <Arrow customArrowIcon={customArrowIcon} className={className?.arrow} />
      </div>
    </div>
  );
};

function areEqual(
  prev: HtmlSelectProps,
  next: HtmlSelectProps
): boolean {
  return (
    prev.countryCode === next.countryCode &&
    prev.handleChangeSelect === next.handleChangeSelect &&
    prev.selectFieldName === next.selectFieldName &&
    prev.direction === next.direction &&
    prev.flagBaseUrl === next.flagBaseUrl &&
    prev.moveKeyToTop === next.moveKeyToTop &&
    prev.className === next.className &&
    prev.customArrowIcon === next.customArrowIcon
  );
}

export default memo(HtmlSelect, areEqual);
