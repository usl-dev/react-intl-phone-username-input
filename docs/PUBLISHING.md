# Publishing to npm

This document describes how to publish this package to the **npm registry** so users can install it with npm, yarn, pnpm, or bun.

---

## 1. Prerequisites

- **npm account** – [Sign up](https://www.npmjs.com/signup) if you don’t have one.
- **Package name** – The name `react-intl-phone-username-input` might already be taken. Check:
  ```bash
  npm search react-intl-phone-username-input
  ```
  Or try:
  ```bash
  npm view react-intl-phone-username-input
  ```
  If it returns 404, the name is free. If taken, use a **scoped name** (e.g. `@yourusername/react-intl-phone-username-input`) and update `name` in `package.json`.

---

## 2. Configuration in `package.json`

These fields are already set (or you can adjust them):

| Field | Purpose |
|-------|--------|
| `name` | Package name on npm (must be unique or scoped). |
| `version` | Set to `1.0.0` (or `0.1.0`) for first publish; use [semver](https://semver.org/) after that. |
| `description` | Short summary (shown on npm and in `npm install`). |
| `keywords` | Helps discovery on npm. |
| `license` | `MIT` (or your chosen license). |
| `repository` | Git URL (replace `yourusername` with your GitHub username). |
| `homepage` | Usually the repo URL or docs. |
| `main` | Entry for Node/CommonJS (`require`). |
| `module` | Entry for ESM (`import`). |
| `types` | TypeScript declarations entry. |
| `exports` | Modern entry points including `types`, `import`, `require`. |
| `files` | Only `dist` is published; everything else is ignored. |
| `peerDependencies` | React 18+ (consumers must have React). |
| `dependencies` | libphonenumber-js (installed with your package; not listed in user’s package.json). |
| `prepublishOnly` | Runs `npm run build` before publish so `dist` is up to date. |

**Before first publish:**

1. Set **version** (e.g. `1.0.0`):
   ```bash
   npm version 1.0.0 --no-git-tag-version
   ```
2. Replace **repository** and **homepage** URLs with your actual GitHub (or other) URLs.

---

## 3. Build

Ensure the library builds and that `dist` contains what you expect:

```bash
npm run build
```

Check that `dist/` has at least:

- `index.esm.js`, `index.cjs`
- `react-intl-phone-username-input.css`
- `types/` (`.d.ts` files)
- Any code-split chunks (e.g. `countryList-*.js`, `index-*.js`)

Consumers should also be able to import the stylesheet via:

```ts
import "react-intl-phone-username-input/style.css";
```

By default, flag images are fetched from `https://flagcdn.com`. If your consumers need self-hosted assets, they can pass `options.flagBaseUrl` such as `"/flags"`.

---

## 4. Log in to npm

From the project root:

```bash
npm login
```

Follow the prompts (username, password, OTP if 2FA is enabled). To use a different registry:

```bash
npm config set registry https://registry.npmjs.org/
```

---

## 5. Publish

**Unscoped package** (e.g. `react-intl-phone-username-input`):

```bash
npm publish
```

**Scoped package** (e.g. `@yourusername/react-intl-phone-username-input`):

Scoped packages are private by default. To publish as **public**:

```bash
npm publish --access public
```

After that, users can install with any of the following.

---

## 6. How users install

Once the package is published, anyone can run:

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

Replace the package name with your scoped name if you used one (e.g. `@yourusername/react-intl-phone-username-input`).  
`libphonenumber-js` is installed automatically as a dependency of your package and will not appear in the user’s `package.json`. Users only need React 18+ (peer dependency) in their project.

---

## 7. After publishing

- **npm page:** `https://www.npmjs.com/package/react-intl-phone-username-input` (or your scoped package URL).
- **New versions:** Bump version (`npm version patch|minor|major`), then run `npm publish` again. `prepublishOnly` will run the build automatically.
- **Unpublish:** Avoid unpublishing if others depend on it. Prefer deprecation:
  ```bash
  npm deprecate react-intl-phone-username-input "Use @yourusername/react-intl-phone-username-input instead"
  ```

---

## 8. Optional: `.npmignore`

You’re using the **`files`** field in `package.json` (only `dist` is included), so you don’t need `.npmignore` for basic publishing. If you add a `.npmignore`, it **overrides** `.gitignore` for the tarball; with `files`, only listed paths are included, so `.npmignore` is only useful to exclude something inside `dist` (rare).

---

## Quick checklist

- [ ] npm account created
- [ ] Package name available or scoped name set in `package.json`
- [ ] `version` set (e.g. `1.0.0`)
- [ ] `repository` and `homepage` updated
- [ ] `npm run build` succeeds
- [ ] `npm login` done
- [ ] `npm publish` (or `npm publish --access public` for scoped)
- [ ] README has install instructions and notes peer deps (React only)
