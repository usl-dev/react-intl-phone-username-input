# Publishing to npm

---

## First-time publish

### 1. Check package name availability

```bash
yarn npm info react-intl-phone-username-input
```

If it returns a 404, the name is free. Otherwise use a scoped name like `@usl-dev/react-intl-phone-username-input` and update `name` in `package.json`.

---

### 2. Set version

```bash
npm version 1.0.0 --no-git-tag-version
```

---

### 3. Update `package.json` fields

Make sure these are filled in before publishing:

| Field         | Value                            |
| ------------- | -------------------------------- |
| `name`        | Package name (unique, or scoped) |
| `version`     | `1.0.0` for first publish        |
| `description` | Short summary                    |
| `repository`  | Your GitHub repo URL             |
| `homepage`    | Repo URL or docs URL             |

---

### 4. Build

```bash
yarn build
```

Verify `dist/` contains:

- `index.esm.js`, `index.cjs`
- `react-intl-phone-username-input.css`
- `types/` (`.d.ts` files)

---

### 5. Log in to npm

```bash
npm login
```

Enter your username, password, and OTP if 2FA is enabled.

---

### 6. Publish

**Unscoped package:**

```bash
npm publish
```

**Scoped package** (scoped packages are private by default):

```bash
npm publish --access public
```

---

## Updating an existing version

### 1. Bump version

```bash
# Pick one:
npm version patch --no-git-tag-version   # 1.0.0 → 1.0.1  (bug fix)
npm version minor --no-git-tag-version   # 1.0.0 → 1.1.0  (new feature)
npm version major --no-git-tag-version   # 1.0.0 → 2.0.0  (breaking change)
```

---

### 2. Build + publish

`prepublishOnly` in `package.json` runs `yarn build` automatically, so just run:

```bash
npm publish
# or for scoped:
npm publish --access public
```

---

## After publishing

- npm page: `https://www.npmjs.com/package/react-intl-phone-username-input`
- Users install with:

```bash
yarn add react-intl-phone-username-input
```

`libphonenumber-js` installs automatically as a dependency. Users only need React 18+ as a peer dependency.

---

## Quick checklist

**First publish**

- [ ] Name available or scoped name set
- [ ] `version` set to `1.0.0`
- [ ] `repository` and `homepage` updated
- [ ] `yarn build` succeeds
- [ ] `npm login` done
- [ ] `npm publish` (add `--access public` if scoped)

**Subsequent releases**

- [ ] `npm version patch|minor|major --no-git-tag-version`
- [ ] `npm publish`
