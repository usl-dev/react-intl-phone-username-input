# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `onValidityChange` prop — fires whenever the phone validity state changes, emitting a `PhoneValidityState` object with `status`, `isValid`, and `isPossible` fields. Only fires in phone mode or when hybrid-mode value looks like a phone number.
- `validatePhone(value, countryCode?)` — new named export for standalone phone validation. Returns a `PhoneValidityState`. Works independently of the component, suitable for use with Zod, react-hook-form, Formik, or any custom validation logic.
- `PhoneValidityState` and `PhoneValidityStatus` — new exported TypeScript types.
- `useStableId` hook — internal React 17-compatible polyfill for `useId`, enabling backward compatibility without breaking React 18 SSR behavior.

### Changed
- Widened `peerDependencies` to support **React 17+** (previously required React 18+). On React 18+, native `useId` is used for SSR-safe stable IDs. On React 17, a counter-based polyfill is used transparently.
- Added npm keywords: `react-hook-form`, `formik`, `zod`, `nextjs`, `next.js`, `country-select`, `dial-code`, `phone-validation`, `flag`, `country-flag`, `shadcn`, `phone-formatter`, `hybrid-input`.

---

## [1.0.4] — 2025-04-xx

### Fixed
- Hybrid mode flag and select bug fix.

## [1.0.3] — 2025-04-xx

### Added
- New keywords for improved discoverability.

## [1.0.2] — 2025-04-xx

### Added
- New keywords added.

## [1.0.1] — 2025-04-xx

### Changed
- Initial stable release adjustments.

## [1.0.0] — 2025-04-xx

### Added
- Initial release: international phone + username hybrid input with country selector, flag display, RTL support, and libphonenumber-js integration.
- MIT license and funding configuration.
