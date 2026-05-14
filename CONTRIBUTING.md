# Contributing

Thank you for your interest in contributing! This guide covers how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/usl-dev/react-intl-phone-username-input.git
cd react-intl-phone-username-input

# Install dependencies
npm install

# Start the example app (live reload)
npm run dev
```

The example app at `example/App.tsx` covers all major use cases — add yours there when building a new feature.

## Project Structure

```
src/
  components/          # React components (InputField, CountrySelect, Flag, Arrow)
  hooks/               # useInputHook, useCustomSelect, useDeviceType, useClickOutside, useStableId
  helpers/             # Pure utilities: phone formatting, validation, limits, country helpers
  types/               # TypeScript types (types.ts)
  assets/              # Country list, constants, minimal country list
  styles/              # CSS modules for each component
  index.ts             # Public API — only export what consumers need
```

## Running Tests

```bash
npm run test:run      # Single pass
npm run test          # Watch mode
```

Tests live alongside their components in `*.test.tsx` files. Please add or update tests for any behaviour you change.

## Building

```bash
npm run build         # ESM + CJS + types + CSS
npm run build:analyze # Same + bundle visualization (dist/stats.html)
```

## Making Changes

1. **Fork** the repository and create a branch: `git checkout -b feat/my-feature`
2. Make your changes. Keep commits small and focused.
3. Add or update tests for any new behaviour.
4. Run `npm run test:run` — all tests must pass.
5. Run `npm run build` — the build must succeed with no TypeScript errors.
6. Open a Pull Request against `main` with a clear description of what changed and why.

## Code Style

- TypeScript strict mode is enabled — no `any` without a comment explaining why.
- No comments that explain *what* the code does; only *why* (non-obvious constraints, workarounds).
- Keep components memoized where they already are; don't add memo without a measured reason.
- CSS uses modules — no global class names. RTL variants go in the same module file.

## Reporting Bugs

Open an issue with:
- A minimal reproduction (StackBlitz or CodeSandbox link preferred)
- React version, bundler, and OS
- Expected vs. actual behaviour

## Feature Requests

Open a GitHub Discussion before opening a PR for large features. This saves time if the direction needs to be aligned first.

## Release Process (maintainers)

1. Update version in `package.json`.
2. Update `CHANGELOG.md` with the release date.
3. Commit: `git commit -m "chore: release vX.Y.Z"`
4. Tag: `git tag vX.Y.Z && git push --tags`
5. Publish: `npm publish` (runs `prepublishOnly` → `npm run build` automatically).
