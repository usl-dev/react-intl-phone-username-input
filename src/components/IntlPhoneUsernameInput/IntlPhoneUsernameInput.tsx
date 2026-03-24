import React, { useEffect, useMemo, Suspense, lazy } from "react";
import InputField from "../InputField";
import Flag from "../Flag";
import Arrow from "../CountrySelect/Arrow";
import { IntlPhoneUsernameInputProps } from "@/types/types";
import useInputHook from "@/hooks/useInputHook";
import styles from "@/styles/intlPhoneUsernameInput.module.css";
import htmlSelectStyles from "@/styles/htmlSelect.module.css";
import customSelectStyles from "@/styles/customSelect.module.css";
import { useDeviceType } from "@/hooks/useDeviceType";
import clsx from "clsx";
import { getValidOptions } from "@/helpers/getValidOptions";
import { cleanProps } from "@/helpers/cleanProps";
import { SELECT_FIELD_NAME } from "@/assets/constants";

const loadCustomSelect = () =>
  import("../CountrySelect/CustomSelect").then((m) => ({ default: m.default }));
const loadHtmlSelect = () =>
  import("../CountrySelect/HtmlSelect").then((m) => ({ default: m.default }));

const CustomSelectLazy = lazy(loadCustomSelect);
const HtmlSelectLazy = lazy(loadHtmlSelect);

const IntlPhoneUsernameInput = React.forwardRef<
  HTMLInputElement,
  IntlPhoneUsernameInputProps
>((props, forwardedRef) => {
  const {
    value,
    onChange,
    selectFieldName = SELECT_FIELD_NAME,
    options = {},
    className: rootClassName,
    max: _max,
    min: _min,
    type: _type,
    onChangeSelect,
    ...rest
  } = props;

  const inputProps = useMemo(() => cleanProps(rest), [rest]);
  const finalOptions = useMemo(() => getValidOptions(options), [options]);

  const {
    multiCountry,
    enableFlag,
    customSelect,
    mode,
    defaultCountry,
    highlightCountries,
    preferredCountries,
    customArrowIcon,
    direction,
    enforceCustomSelect,
    enforceHtmlSelect,
    flagBaseUrl,
    classes,
    format,
    hideDialCode,
  } = finalOptions;

  const {
    countryDetails,
    inputRef,
    handleInputChange,
    handleChangeSelect,
    handleClick,
    moveKeyToTop,
    inputValue,
    isNumber,
    markPaste,
    effectiveMaxLength,
  } = useInputHook({
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
  });

  const isMobile = useDeviceType();

  useEffect(() => {
    if (!multiCountry) {
      return;
    }

    if (enforceCustomSelect) {
      void loadCustomSelect();
      return;
    }

    if (enforceHtmlSelect) {
      void loadHtmlSelect();
      return;
    }

    if (isMobile) {
      void loadHtmlSelect();
      return;
    }

    void loadCustomSelect();
  }, [multiCountry, enforceCustomSelect, enforceHtmlSelect, isMobile]);

  const mergedInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, inputRef]
  );

  const renderSelect = useMemo(() => {
    if (!multiCountry) {
      return null;
    }

    const htmlSelectClasses = classes?.html_select as
      | { [key: string]: string }
      | undefined;
    const customSelectClasses = classes?.custom_select as
      | { [key: string]: string }
      | undefined;

    const selectVariant =
      enforceCustomSelect || (!enforceHtmlSelect && !isMobile)
        ? "custom"
        : "html";

    const selectFallback =
      selectVariant === "html" ? (
        <div
          data-component="html-select-fallback"
          className={clsx(
            htmlSelectStyles["select-container"],
            direction === "rtl" && htmlSelectStyles.rtl,
            htmlSelectClasses?.html_select_container
          )}
          aria-hidden="true"
        >
          <div
            className={clsx(
              htmlSelectStyles["select-wrapper"],
              htmlSelectClasses?.select_wrapper
            )}
            style={{ pointerEvents: "none" }}
          >
            <Flag
              countryCode={countryDetails?.code}
              label={countryDetails?.label}
              direction={direction}
              flagBaseUrl={flagBaseUrl}
              className={htmlSelectClasses?.flag}
            />
            <Arrow
              customArrowIcon={customArrowIcon}
              className={htmlSelectClasses?.arrow}
            />
          </div>
        </div>
      ) : (
        <div
          data-component="custom-select-fallback"
          className={clsx(
            customSelectStyles["select-container"],
            direction === "rtl" && customSelectStyles.rtl,
            customSelectClasses?.select_container
          )}
          aria-hidden="true"
        >
          <button
            type="button"
            tabIndex={-1}
            className={clsx(
              customSelectStyles["select-overlay-btn"],
              customSelectClasses?.select_overlay_btn
            )}
            style={{ pointerEvents: "none" }}
          >
            <Flag
              countryCode={countryDetails?.code}
              label={countryDetails?.label}
              direction={direction}
              flagBaseUrl={flagBaseUrl}
              className={customSelectClasses?.flag}
              size="sm"
            />
            <Arrow
              customArrowIcon={customArrowIcon}
              className={customSelectClasses?.arrow}
            />
          </button>
        </div>
      );

    if (enforceCustomSelect) {
      return (
        <Suspense fallback={selectFallback}>
          <CustomSelectLazy
            handleChangeSelect={handleChangeSelect}
            moveKeyToTop={moveKeyToTop}
            countryCode={countryDetails?.code}
            selectFieldName={selectFieldName}
            customArrowIcon={customArrowIcon}
            direction={direction}
            flagBaseUrl={flagBaseUrl}
            className={classes?.custom_select as { [key: string]: string }}
            {...customSelect}
          />
        </Suspense>
      );
    }

    if (enforceHtmlSelect) {
      return (
        <Suspense fallback={selectFallback}>
          <HtmlSelectLazy
            handleChangeSelect={handleChangeSelect}
            moveKeyToTop={moveKeyToTop}
            countryCode={countryDetails?.code}
            selectFieldName={selectFieldName}
            customArrowIcon={customArrowIcon}
            className={classes?.html_select as { [key: string]: string }}
            direction={direction}
            flagBaseUrl={flagBaseUrl}
          />
        </Suspense>
      );
    }

    return isMobile ? (
      <Suspense fallback={selectFallback}>
        <HtmlSelectLazy
          handleChangeSelect={handleChangeSelect}
          moveKeyToTop={moveKeyToTop}
          countryCode={countryDetails?.code}
          selectFieldName={selectFieldName}
          customArrowIcon={customArrowIcon}
          direction={direction}
          flagBaseUrl={flagBaseUrl}
          className={classes?.html_select as { [key: string]: string }}
        />
      </Suspense>
    ) : (
      <Suspense fallback={selectFallback}>
        <CustomSelectLazy
          handleChangeSelect={handleChangeSelect}
          moveKeyToTop={moveKeyToTop}
          countryCode={countryDetails?.code}
          selectFieldName={selectFieldName}
          customArrowIcon={customArrowIcon}
          className={classes?.custom_select as { [key: string]: string }}
          direction={direction}
          flagBaseUrl={flagBaseUrl}
          {...customSelect}
        />
      </Suspense>
    );
  }, [
    multiCountry,
    enforceCustomSelect,
    enforceHtmlSelect,
    isMobile,
    handleChangeSelect,
    moveKeyToTop,
    countryDetails?.code,
    selectFieldName,
    customArrowIcon,
    direction,
    flagBaseUrl,
    classes?.custom_select,
    classes?.html_select,
    customSelect,
  ]);

  const renderFlag = useMemo(() => {
    if (!multiCountry && enableFlag && isNumber) {
      return (
        <div
          className={clsx(
            styles["flag-container"],
            direction === "rtl" && styles["rtl"],
            classes?.flag_container
          )}
        >
          <Flag
            countryCode={countryDetails?.code}
            label={countryDetails?.label}
            direction={direction}
            flagBaseUrl={flagBaseUrl}
            className={classes?.flag as string}
          />
        </div>
      );
    }
    return null;
  }, [
    multiCountry,
    enableFlag,
    isNumber,
    countryDetails?.code,
    direction,
    flagBaseUrl,
    classes?.flag_container,
    classes?.flag,
  ]);

  return (
    <div
      className={clsx(
        styles.container,
        direction === "rtl" && styles.rtl,
        classes?.intlPhoneUsernameInputWrapper,
        rootClassName
      )}
    >
      {renderFlag}
      {renderSelect}
      <InputField
        multiCountry={multiCountry}
        inputValue={inputValue}
        handleInputChange={handleInputChange}
        inputRef={mergedInputRef}
        handleClick={handleClick}
        direction={direction}
        phoneMode={mode === "phone"}
        isNumber={isNumber}
        className={classes?.input_box as string}
        enableFlag={multiCountry ? true : enableFlag}
        markPaste={markPaste}
        {...inputProps}
        {...(effectiveMaxLength !== undefined && { maxLength: effectiveMaxLength })}
      />
    </div>
  );
});

IntlPhoneUsernameInput.displayName = "IntlPhoneUsernameInput";

// Simplified memo comparison for better performance
export default React.memo(IntlPhoneUsernameInput, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.onChangeSelect === nextProps.onChangeSelect &&
    // Use reference equality for options - parent should memoize this object
    prevProps.options === nextProps.options &&
    prevProps.className === nextProps.className &&
    prevProps.selectFieldName === nextProps.selectFieldName &&
    prevProps.max === nextProps.max &&
    prevProps.min === nextProps.min &&
    prevProps.type === nextProps.type
  );
});
