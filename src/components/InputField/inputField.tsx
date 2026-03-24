import React from "react";
import styles from "@/styles/inputField.module.css";
import { InputFieldProps } from "@/types/types";
import clsx from "clsx";
import { useId } from "react";

const InputField = (props: InputFieldProps) => {
  const {
    handleInputChange,
    inputRef,
    handleClick,
    multiCountry,
    inputValue,
    direction,
    phoneMode,
    isNumber,
    className,
    enableFlag,
    markPaste,
    ...rest
  } = props;

  const id = useId();

  // Extract user-supplied onPaste so we can compose it with markPaste.
  // markPaste() must fire BEFORE onChange so the paste flag is set when
  // handleInputChange reads it.
  const { onPaste: userOnPaste, ...spreadableRest } = rest;

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      markPaste?.();
      userOnPaste?.(e);
    },
    [markPaste, userOnPaste]
  );

  const inputClassName = clsx(
    styles.inputBox,
    multiCountry && styles.multiCountryInput,
    direction === "rtl" && styles.rtl,
    className
  );

  return (
    <input
      data-component="input-field"
      ref={inputRef}
      id={id}
      value={inputValue}
      onChange={handleInputChange}
      onClick={handleClick}
      onPaste={handlePaste}
      dir={direction}
      inputMode={phoneMode ? "numeric" : "text"}
      pattern={phoneMode ? "\d*" : undefined}
      className={inputClassName}
      aria-label={spreadableRest["aria-label"] ?? spreadableRest.placeholder ?? "text-input"}
      aria-invalid={spreadableRest["aria-invalid"] ?? false}
      aria-required={spreadableRest.required ?? false}
      {...spreadableRest}
    />
  );
};

// Memo with default shallow comparison; parent should pass stable refs/callbacks
export default React.memo(InputField);
