type InputPassthroughProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "max" | "min" | "onChange" | "type" | "value"
>;

export type Mode = "phone" | "hybrid";
export type Direction = "ltr" | "rtl";
export type CountrySelectSource = "custom-select" | "native-select";

export type CountrySelectChange = {
  countryCode: string;
  dialCode: string;
  label?: string;
  name?: string;
  source: CountrySelectSource;
};

export type IntlPhoneUsernameInputProps = InputPassthroughProps & {
  value: string;
  onChange: (value: string) => void;
  onChangeSelect?: (change: CountrySelectChange) => void;
  selectFieldName?: string;
  options?: Options;
  /** Class name applied to the root wrapper (recommended for layout/overrides). */
  className?: string;
  /** Stripped and not forwarded to input (reserved for internal use). */
  max?: number;
  min?: number;
  type?: string;
};

export type CustomSelectProps = {
  moveKeyToTop: Country[];
  countryCode: string;
  handleChangeSelect: (change: CountrySelectChange) => void;
  selectFieldName?: string;
  showFlag?: boolean;
  showDialCode?: boolean;
  customArrowIcon?: React.ReactNode;
  direction?: Direction;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  flagBaseUrl?: string;
  className?: {
    [key: string]: string;
  };
};

export type HtmlSelectProps = {
  moveKeyToTop: Country[];
  countryCode: string;
  handleChangeSelect: (change: CountrySelectChange) => void;
  selectFieldName?: string;
  customArrowIcon?: React.ReactNode;
  direction?: Direction;
  flagBaseUrl?: string;
  className?: {
    [key: string]: string;
  };
};

export type FlagProps = {
  countryCode: string;
  /** Optional label for img alt (avoids loading full country list when passed from parent). */
  label?: string;
  customSelect?: boolean;
  direction?: Direction;
  flagBaseUrl?: string;
  className?: string;
  /** Smaller flag when used in custom select trigger/dropdown */
  size?: "sm" | "md";
};

export type PhoneInputLimits = {
  maxLength: number;
  minLength: number;
};

export type InputFieldProps = InputPassthroughProps & {
  handleInputChange: (e: InputEvent) => void;
  inputRef: React.Ref<HTMLInputElement>;
  handleClick: (e: ClickEvent) => void;
  multiCountry?: boolean;
  inputValue: string;
  direction?: Direction;
  phoneMode: boolean;
  isNumber: boolean;
  className?: string;
  enableFlag?: boolean;
  markPaste?: () => void;
};

type CustomSelectConfig = {
  showFlag?: boolean;
  showDialCode?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
};

export type Options = {
  mode?: Mode;
  format?: boolean;
  customSelect?: CustomSelectConfig;
  enableFlag?: boolean;
  multiCountry?: boolean;
  defaultCountry?: string;
  preferredCountries?: string[];
  highlightCountries?: string[];
  customArrowIcon?: React.ReactNode;
  direction?: Direction;
  enforceCustomSelect?: boolean;
  enforceHtmlSelect?: boolean;
  flagBaseUrl?: string;
  classes?: Classes;
  hideDialCode?: boolean;
};

export interface Classes {
  [key: string]: string | Classes;
}

export type Country = {
  label: string;
  value: string;
  dial_code: string;
  image: string;
};

export type CountryState = {
  presentDialCode: string;
  code: string;
  label?: string;
};

export type ExtendedOptions = Options & {
  value: string;
  onChange: (value: string) => void;
  onChangeSelect?: (change: CountrySelectChange) => void;
  selectFieldName?: string;
};

export type UseInputHookReturn = {
  countryDetails: CountryState;
  handleInputChange: (e: InputEvent) => void;
  inputRef: RefType;
  handleClick: (e: ClickEvent) => void;
  handleChangeSelect: (change: CountrySelectChange) => void;
  moveKeyToTop: Country[];
  inputValue: string;
  isNumber: boolean;
  phoneLimits: PhoneInputLimits | null;
  markPaste: () => void;
  effectiveMaxLength: number | undefined;
};

export type ArrowProps = {
  customSelect?: boolean;
  customArrowIcon?: React.ReactNode; // Accept a custom SVG
  className?: string;
};

export type InputEvent = React.ChangeEvent<HTMLInputElement>;
export type ClickEvent = React.MouseEvent<HTMLInputElement>;
export type SelectEvent = React.ChangeEvent<HTMLSelectElement>;
export type RefType = React.RefObject<HTMLInputElement | null>;
export type BtnClickEvent = React.MouseEvent<HTMLButtonElement>;
