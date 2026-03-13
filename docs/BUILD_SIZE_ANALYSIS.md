# Build size analysis

## Current output (code-split + lazy load)

The library uses **code-splitting** and **lazy loading** so that the initial payload is small and heavier parts load on demand.

| Asset | Size (min) | Gzip | Notes |
|-------|------------|------|--------|
| **index.esm.js** | ~0.8 kB | ~0.35 kB | Entry; loads other chunks on demand |
| **index.cjs** | ~1.3 kB | ~0.4 kB | Entry (CJS) |
| **countryList-*.js** | ~24 kB (ESM) / ~17 kB (CJS) | ~4 kB | Lazy-loaded full country list |
| **index-*.js** (multiple) | varies | varies | Lazy-loaded components (CustomSelect, HtmlSelect, hooks, etc.) |
| **arrow-*.js** | ~0.9 kB | ~0.5 kB | Shared arrow icon chunk |
| **react-intl-phone-username-input.css** | 6.71 kB | 1.76 kB | Styles |

**Published package size:** `npm pack --dry-run` now reports a `36.5 kB` tarball (`135.7 kB` unpacked). The tarball no longer includes bundled flag SVGs, which had been the biggest publish-size cost in earlier builds.

**Initial load:** Only the entry file (~0.8 kB ESM) is required upfront. The rest loads when:

- **Country list chunk:** Loaded on component mount (dynamic `import('@/assets/countryList')` in `useInputHook`). Until then, a minimal list (IN, US) is used for default country and dial code.
- **CustomSelect / HtmlSelect chunks:** Loaded when `multiCountry` is true and the country selector is rendered (React.lazy).

---

## How it works

### Lazy-loaded country list

- **Minimal list** (in main bundle): India (IN) and United States (US) for initial render and default country.
- **Full list** (~240+ countries): Fetched asynchronously via `import('@/assets/countryList')` after mount. When it resolves, the component switches to the full list for the dropdown and labels. No blocking of first paint.

### Dynamic import for country selector

- **CustomSelect** (search, keyboard nav, custom UI) and **HtmlSelect** (native `<select>`) are loaded with `React.lazy()` only when `multiCountry` is true.
- If the input is used only for a single country (e.g. `multiCountry: false`), those selector chunks are never requested.

### Flag delivery

- Flags are resolved at runtime from `https://flagcdn.com` by default.
- Consumers can self-host flags by setting `options.flagBaseUrl`, for example `"/flags"`.
- This keeps the published package much smaller because `dist/assets/flags` is no longer shipped.

### Externals (not in the bundle)

- **react** and **react/jsx-runtime** are peer/runtime externals, so the consuming app must provide them.
- **libphonenumber-js** (and subpaths) is also externalized from the bundle, but it is shipped as this package's runtime dependency and is installed automatically for consumers.

---

## Previous single-bundle reference (before optimizations)

Before lazy-load and code-split, the build produced a single ESM file (~57 kB min, ~13.5 kB gzip). The same logic is now split so that:

- Main bundle is minimal (entry only).
- Country list and selector UI are separate chunks that load when needed.

---

## Regenerating the treemap

Build with the visualizer:

```bash
npm run build:analyze
```

Then open **`dist/stats.html`** in a browser to see the interactive treemap (and gzip/brotli sizes). Note: with code-splitting, the treemap may show multiple output chunks.
