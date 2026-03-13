import React from "react";
import styles from "@/styles/inputField.module.css";
import { InputFieldProps } from "@/types/types";
import clsx from "clsx";
import { useId } from "react";

const InputField: React.FC<InputFieldProps> = (props) => {
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
    ...rest
  } = props;

  const id = useId();

  const inputClassName = clsx(
    styles.inputBox,
    multiCountry && styles.multiCountryInput,
    !multiCountry && isNumber && enableFlag && styles.number,
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
      dir={direction}
      inputMode={phoneMode ? "numeric" : "text"}
      pattern={phoneMode ? "\\d*" : undefined}
      className={inputClassName}
      aria-label={rest["aria-label"] ?? rest.placeholder ?? "text-input"}
      aria-invalid={rest["aria-invalid"] ?? false}
      aria-required={rest.required ?? false}
      {...rest}
    />
  );
};

// Memo with default shallow comparison; parent should pass stable refs/callbacks
export default React.memo(InputField);
