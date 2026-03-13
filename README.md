# React International Phone Username Input

A React component for international phone numbers and usernames (e.g. email) in one field. Supports 240+ countries, optional country selector, phone formatting, RTL, and is built for performance with lazy loading and code-splitting.

---

## Features

- **Dual purpose** – Single input for **phone** or **username/email**; mode can be fixed or hybrid (auto-detect).
- **Multi-country support** – 240+ countries with flags and dial codes; optional dropdown to choose country.
- **Phone-only or hybrid** – `mode: "phone"` for numbers only; `mode: "hybrid"` accepts text or phone and formats when it looks like a number.
- **Country selector** – Custom dropdown (search + keyboard) or native `<select>`; auto choice on mobile vs desktop.
- **Formatting** – Optional as-you-type formatting via `libphonenumber-js`.
- **RTL** – `direction: "rtl"` for right-to-left layout and text.
- **Customizable** – Root `className`, `options.classes` for per-part styling, and pass-through input props.
- **Performance** – Lazy-loaded country list and dynamically imported selector components; memoized components; small initial bundle.
- **TypeScript** – Typed props and options.
- **Accessibility** – ARIA attributes, keyboard navigation in custom dropdown, semantic markup.

---

## When to use it

Use this component when you want one reusable field that can:

- Collect phone numbers with country-aware formatting
- Switch between a custom country dropdown and a native mobile-friendly select
- Accept either phone numbers or username/email-like text in the same controlled input
- Fit into forms without having to rebuild flag, dial code, and country selection logic in every project

---

## Installation

Install the package. Only **React 18+** is required as a peer dependency (your app likely has it already). `libphonenumber-js` is installed automatically with this package and will not appear in your `package.json`.

```bash
# npm
npm install react-intl-phone-username-input

# yarn
yarn add react-intl-phone-username-input

# pnpm
pnpm add react-intl-phone-username-input

# bun
bun add react-intl-phone-username-input
```

**Peer dependency:** `react` (18+). Your app must have React installed.

Flags are loaded from `https://flagcdn.com` by default. If your app needs self-hosted assets or has a strict CSP, set `options.flagBaseUrl` to your own flag path.

---

## TypeScript and JavaScript support

This package works in both TypeScript and JavaScript React projects.

- **TypeScript** – Ships declaration files, typed props, typed options, and typed utility re-exports.
- **JavaScript** – Ships compiled ESM and CommonJS builds, so you can use it from regular React `.js` / `.jsx` apps too.

If you are using JavaScript, you still get editor IntelliSense in most IDEs because the package publishes `.d.ts` files alongside the runtime build.

---

## Quick start

```tsx
import { IntlPhoneUsernameInput } from "react-intl-phone-username-input";
import "react-intl-phone-username-input/style.css";
import { useState } from "react";

export default function App() {
  const [value, setValue] = useState("");

  return (
    <IntlPhoneUsernameInput
      value={value}
      onChange={setValue}
      options={{
        mode: "phone",
        defaultCountry: "IN",
        multiCountry: true,
        enableFlag: true,
      }}
      placeholder="Enter phone number"
    />
  );
}
```

---

## How it works

- **Controlled input** – You control `value` and update it via `onChange(value)`. The component does not hold the value internally.
- **Options** – All behavior is driven by the `options` prop (mode, default country, multi-country, formatting, etc.). Memoizing `options` (e.g. `useMemo`) avoids unnecessary re-renders.
- **Lazy loading** – The full country list (240+ entries) is loaded asynchronously after mount. Until then, a minimal list (default country + fallback) is used so the input works immediately. The country selector and its UI (CustomSelect / HtmlSelect) are loaded only when `multiCountry` is true (dynamic import).
- **Form-friendly country selection** – Native select uses `selectFieldName` directly. Custom select renders a hidden input with the same name so form posts stay consistent.
- **Flags are configurable** – By default flags load from `https://flagcdn.com`; set `flagBaseUrl` to self-host them.
- **Bundle size** – Initial script load is small; country list and selector UI load on demand. See [Build size analysis](docs/BUILD_SIZE_ANALYSIS.md) for details.

---

## Usage examples

### Phone-only with country selector

```tsx
<IntlPhoneUsernameInput
  value={value}
  onChange={setValue}
  options={{
    mode: "phone",
    defaultCountry: "IN",
    multiCountry: true,
    enableFlag: true,
    format: true,
  }}
  placeholder="Enter phone number"
/>
```

### Custom dropdown (search + keyboard)

```tsx
<IntlPhoneUsernameInput
  value={value}
  onChange={setValue}
  options={{
    mode: "phone",
    defaultCountry: "US",
    multiCountry: true,
    enforceCustomSelect: true,
    customSelect: {
      showFlag: true,
      showDialCode: true,
      enableSearch: true,
      searchPlaceholder: "Search countries...",
    },
  }}
  placeholder="Use ↑↓ and Enter in the dropdown"
/>
```

### Hybrid (username, email, or phone)

```tsx
<IntlPhoneUsernameInput
  value={value}
  onChange={setValue}
  options={{
    mode: "hybrid",
    defaultCountry: "US",
    enableFlag: true,
  }}
  placeholder="Enter username, email, or phone"
/>
```

### RTL

```tsx
<IntlPhoneUsernameInput
  value={value}
  onChange={setValue}
  options={{
    mode: "phone",
    direction: "rtl",
    defaultCountry: "AE",
    multiCountry: true,
  }}
  placeholder="أدخل رقم الهاتف"
/>
```

### Hide dial code in input

```tsx
<IntlPhoneUsernameInput
  value={value}
  onChange={setValue}
  options={{
    mode: "phone",
    defaultCountry: "IN",
    multiCountry: true,
    hideDialCode: true,
  }}
  placeholder="Phone number only"
/>
```

### Preferred and highlighted countries

```tsx
<IntlPhoneUsernameInput
  value={value}
  onChange={setValue}
  options={{
    mode: "phone",
    multiCountry: true,
    defaultCountry: "US",
    highlightCountries: ["AE"],
    preferredCountries: ["GB", "IN"],
  }}
/>
```

`highlightCountries` always appears first, then `preferredCountries`, then the rest of the country list.

### Self-host flag assets

```tsx
<IntlPhoneUsernameInput
  value={value}
  onChange={setValue}
  options={{
    mode: "phone",
    defaultCountry: "US",
    multiCountry: true,
    flagBaseUrl: "/flags",
  }}
/>
```

When `flagBaseUrl` is set to `"/flags"`, the component requests flags like `"/flags/us.svg"` and `"/flags/in.svg"`.

### Form integration

```tsx
<IntlPhoneUsernameInput
  value={value}
  onChange={setValue}
  selectFieldName="country_code"
  onChangeSelect={(change) => {
    console.log(change.countryCode);
    console.log(change.dialCode);
    console.log(change.source);
  }}
  options={{
    mode: "phone",
    multiCountry: true,
    defaultCountry: "US",
  }}
/>
```

With native select, `selectFieldName` becomes the real `<select name>`. With custom select, the component renders a hidden input using the same name.

### Ref access

```tsx
const inputRef = useRef<HTMLInputElement>(null);

<IntlPhoneUsernameInput
  ref={inputRef}
  value={value}
  onChange={setValue}
  placeholder="Phone"
/>;
```

---

## Props

### Main props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | string | Yes | Current input value (controlled). |
| `onChange` | `(value: string) => void` | Yes | Called when the value changes. |
| `onChangeSelect` | `(change) => void` | No | Called with `{ countryCode, dialCode, label, name, source }` when the selected country changes. |
| `options` | object | No | Configuration; see [Options](#options-object) below. Memoize for best performance. |
| `className` | string | No | Class name for the root wrapper (e.g. layout or global overrides). |
| `selectFieldName` | string | No | Field name used for the country selector. Native select uses it directly; custom select renders a hidden input with this name. |
| `placeholder` | string | No | Input placeholder. |
| Other input props | — | No | Standard input attributes and handlers such as `disabled`, `required`, `name`, `autoComplete`, `onBlur`, `onFocus`, `onKeyDown`, `aria-*`, and `data-*` are passed through to the underlying input. |

### Options object

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Core** | | | |
| `mode` | `"phone"` \| `"hybrid"` | `"hybrid"` | `"phone"`: numbers only; `"hybrid"`: text or phone, format when it looks like a number. |
| `defaultCountry` | string | `"IN"` | Default country (ISO 3166-1 alpha-2, e.g. `"US"`, `"IN"`). Must be supported by `libphonenumber-js`. |
| `multiCountry` | boolean | `false` | Show country selector (dropdown). When true, selector chunks load dynamically. |
| `format` | boolean | `true` | Format phone number as you type. |
| `enableFlag` | boolean | `true` | Show country flag when **not** in multi-country mode (single country + flag only). |
| `hideDialCode` | boolean | `false` | If true, dial code is not shown in the input (still used internally). |
| **Country selector** | | | |
| `enforceCustomSelect` | boolean | `false` | Always use custom dropdown (search + keyboard). |
| `enforceHtmlSelect` | boolean | `false` | Always use native `<select>`. |
| `flagBaseUrl` | string | `"https://flagcdn.com"` | Base URL used to resolve flag SVGs, for example `"/flags"` when self-hosting. |
| `customSelect` | object | see below | Options for the custom dropdown. |
| `customSelect.showFlag` | boolean | `false` | Show flags in dropdown options. |
| `customSelect.showDialCode` | boolean | `false` | Show dial codes in dropdown options. |
| `customSelect.enableSearch` | boolean | `true` | Enable search in dropdown. |
| `customSelect.searchPlaceholder` | string | `"Search"` | Placeholder for search input. |
| **Country order** | | | |
| `preferredCountries` | string[] | `[]` | Country codes to show first, e.g. `["US", "CA", "GB"]`. |
| `highlightCountries` | string[] | `[]` | Country codes to pin above preferred countries at the top of the list. |
| **Layout & styling** | | | |
| `direction` | `"ltr"` \| `"rtl"` | `"ltr"` | Text/layout direction. |
| `classes` | object | `{}` | CSS class overrides; see [Styling](#styling-with-classes-prop). |
| `customArrowIcon` | ReactNode | — | Custom icon for the dropdown trigger. |

When neither `enforceCustomSelect` nor `enforceHtmlSelect` is set, the component picks native select on small screens (e.g. &lt; 768px) and custom dropdown on larger screens.

### `onChangeSelect` payload

```tsx
onChangeSelect={(change) => {
  console.log(change.countryCode); // "IN"
  console.log(change.dialCode); // "+91"
  console.log(change.label); // "India"
  console.log(change.name); // "country_select"
  console.log(change.source); // "native-select" | "custom-select"
}}
```

### Behavior notes

- In `phone` mode, the input always behaves as a phone-number field.
- In `hybrid` mode, text like usernames and email addresses is preserved as text, while phone-like input is formatted when appropriate.
- `defaultCountry` is optional. If omitted, the component falls back to `"IN"` unless `preferredCountries` provides the first valid country.
- `highlightCountries` and `preferredCountries` are normalized to uppercase and invalid country codes are ignored.

---

## Styling with `className` and `classes`

**Root `className`** – Pass a single class for the wrapper (layout, spacing, or CSS that targets inner elements):

```tsx
<IntlPhoneUsernameInput className="my-form-field" value={value} onChange={setValue} />
```

**Per-part overrides** – Use `options.classes` to target specific elements (same pattern as MUI’s `classes`). Your classes are merged with the library’s defaults:

```tsx
<IntlPhoneUsernameInput
  value={value}
  onChange={setValue}
  options={{
    defaultCountry: "IN",
    multiCountry: true,
    classes: {
      intlPhoneUsernameInputWrapper: "my-wrapper",
      input_box: "my-input",
      flag_container: "my-flag-container",
      custom_select: {
        select_container: "my-dropdown",
        country_option: "my-option",
        search_input: "my-search",
      },
      html_select: {
        html_select_container: "my-native-select",
        select_overlay: "my-overlay",
      },
    },
  }}
/>
```

### Class keys

| Key | Description |
|-----|-------------|
| **Main** | |
| `intlPhoneUsernameInputWrapper` | Root wrapper. |
| `input_box` | Text input. |
| `flag_container` | Flag container (single-country mode). |
| `flag` | Flag image. |
| **Custom select** | |
| `custom_select.select_container` | Dropdown container. |
| `custom_select.select_overlay_btn` | Trigger button. |
| `custom_select.dropdown_container` | Dropdown panel. |
| `custom_select.search_input` | Search field. |
| `custom_select.country_list` | List container. |
| `custom_select.country_list_item` | List item wrapper. |
| `custom_select.country_option` | Country button. |
| `custom_select.flag` | Flag on trigger. |
| `custom_select.list_flag` | Flag in list options. |
| `custom_select.arrow` | Arrow icon. |
| **Native select** | |
| `html_select.html_select_container` | Native select container. |
| `html_select.select_wrapper` | Wrapper. |
| `html_select.select_overlay` | Styled overlay. |
| `html_select.flag` | Flag. |
| `html_select.arrow` | Arrow. |

For the full pattern and recommendations, see **[docs/STYLING.md](docs/STYLING.md)**.

---

## Re-exported utilities (`libphonenumber-js`)

You can use the same validation/formatting helpers the component uses:

```tsx
import {
  isValidPhoneNumber,
  isPossiblePhoneNumber,
  parsePhoneNumber,
  parsePhoneNumberWithError,
  formatIncompletePhoneNumber,
  AsYouType,
  getExampleNumber,
  examples,
} from "react-intl-phone-username-input";
```

These are re-exports from `libphonenumber-js` (included as a dependency of this package).

---

## Bundle and performance

- **Initial load:** Only a small entry script is loaded; country list and selector UI are in separate chunks.
- **Lazy country list:** Full list loads after mount; a minimal list is used until then.
- **Lazy selector:** CustomSelect and HtmlSelect are loaded only when `multiCountry` is true.
- **Flags:** SVGs are fetched from the configured `flagBaseUrl` instead of being bundled into the npm package.
- **Memoization:** Components are memoized; keep `options` and callbacks stable (e.g. `useMemo` / `useCallback`) for best performance.

See [docs/BUILD_SIZE_ANALYSIS.md](docs/BUILD_SIZE_ANALYSIS.md) for build output and size notes.

---

## Development

```bash
# Install
npm install

# Build library
npm run build

# Example app
npm run dev
# or
cd example && npm install && npm start
```

---

## Publishing to npm

To publish this package so users can install it with npm, yarn, pnpm, or bun, see **[docs/PUBLISHING.md](docs/PUBLISHING.md)** for step-by-step configuration and commands.

---

## License

MIT. See the LICENSE file in the repository.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/react-intl-phone-username-input/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/react-intl-phone-username-input/discussions)
