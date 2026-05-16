import React, { useState, useMemo } from "react";
import {
  IntlPhoneUsernameInput,
  type PhoneValidityState,
} from "../src";

// ─── Sub-components ──────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  testId,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  testId?: string;
}) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        data-testid={testId}
      />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
    </label>
  );
}

function Segment<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  name?: string;
}) {
  return (
    <div className="segment">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`segment-btn${value === opt.value ? " active" : ""}`}
          onClick={() => onChange(opt.value)}
          data-testid={name ? `seg-${name}-${opt.value}` : undefined}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TagInput({
  tags,
  onChange,
  placeholder,
  testId,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  testId?: string;
}) {
  const [input, setInput] = useState("");

  const commit = () => {
    const tag = input.trim().toUpperCase();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
  };

  return (
    <div className="tag-input">
      {tags.map((t) => (
        <span key={t} className="tag">
          {t}
          <button
            type="button"
            data-testid={`tag-remove-${t}`}
            onClick={() => onChange(tags.filter((x) => x !== t))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        data-testid={testId}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !input && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={tags.length ? "" : placeholder}
      />
    </div>
  );
}

function OptionRow({
  label,
  hint,
  children,
  disabled,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={`option-row${disabled ? " option-row--disabled" : ""}`}>
      <div className="option-label">
        <code>{label}</code>
        {hint && <span className="option-hint">{hint}</span>}
      </div>
      <div className="option-control">{children}</div>
    </div>
  );
}

function OptionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="option-group">
      <div className="option-group-title">{title}</div>
      {children}
    </div>
  );
}

// ─── Code generator ──────────────────────────────────────────────────────────

interface PlaygroundState {
  mode: "phone" | "hybrid";
  multiCountry: boolean;
  format: boolean;
  hideDialCode: boolean;
  enableFlag: boolean;
  direction: "ltr" | "rtl";
  defaultCountry: string;
  placeholder: string;
  enforceCustomSelect: boolean;
  enforceHtmlSelect: boolean;
  showFlag: boolean;
  showDialCode: boolean;
  enableSearch: boolean;
  searchPlaceholder: string;
  preferredCountries: string[];
  highlightCountries: string[];
  showValidityCallback: boolean;
  showSelectCallback: boolean;
}

function generateCode(s: PlaygroundState): string {
  const lines: string[] = [];
  lines.push(
    `import { IntlPhoneUsernameInput } from "react-intl-phone-username-input";`
  );
  lines.push(`import "react-intl-phone-username-input/style.css";`);
  lines.push(`import { useState } from "react";`);
  lines.push(``);
  lines.push(`function MyForm() {`);
  lines.push(`  const [value, setValue] = useState("");`);
  if (s.showValidityCallback)
    lines.push(`  const [validity, setValidity] = useState(null);`);
  lines.push(``);
  lines.push(`  return (`);
  lines.push(`    <IntlPhoneUsernameInput`);
  lines.push(`      value={value}`);
  lines.push(`      onChange={setValue}`);
  if (s.showValidityCallback)
    lines.push(`      onValidityChange={setValidity}`);
  if (s.showSelectCallback)
    lines.push(`      onChangeSelect={(change) => console.log(change)}`);
  if (s.placeholder !== "Enter phone number")
    lines.push(`      placeholder="${s.placeholder}"`);

  const opts: string[] = [];
  if (s.mode !== "hybrid") opts.push(`mode: "${s.mode}"`);
  if (s.multiCountry) opts.push(`multiCountry: true`);
  if (!s.format) opts.push(`format: false`);
  if (s.hideDialCode) opts.push(`hideDialCode: true`);
  if (!s.enableFlag && !s.multiCountry) opts.push(`enableFlag: false`);
  if (s.defaultCountry !== "IN")
    opts.push(`defaultCountry: "${s.defaultCountry}"`);
  if (s.direction !== "ltr") opts.push(`direction: "${s.direction}"`);
  if (s.enforceCustomSelect) opts.push(`enforceCustomSelect: true`);
  if (s.enforceHtmlSelect) opts.push(`enforceHtmlSelect: true`);
  if (s.preferredCountries.length)
    opts.push(
      `preferredCountries: [${s.preferredCountries.map((c) => `"${c}"`).join(", ")}]`
    );
  if (s.highlightCountries.length)
    opts.push(
      `highlightCountries: [${s.highlightCountries.map((c) => `"${c}"`).join(", ")}]`
    );

  const cs: string[] = [];
  if (s.showFlag) cs.push(`showFlag: true`);
  if (s.showDialCode) cs.push(`showDialCode: true`);
  if (!s.enableSearch) cs.push(`enableSearch: false`);
  if (s.searchPlaceholder !== "Search")
    cs.push(`searchPlaceholder: "${s.searchPlaceholder}"`);
  if (cs.length) opts.push(`customSelect: { ${cs.join(", ")} }`);

  if (opts.length) {
    lines.push(`      options={{`);
    opts.forEach((opt, i) =>
      lines.push(`        ${opt}${i < opts.length - 1 ? "," : ""}`)
    );
    lines.push(`      }}`);
  }

  lines.push(`    />`);
  lines.push(`  );`);
  lines.push(`}`);
  return lines.join("\n");
}

// ─── Initial state ───────────────────────────────────────────────────────────

const initial: PlaygroundState = {
  mode: "phone",
  multiCountry: true,
  format: true,
  hideDialCode: false,
  enableFlag: true,
  direction: "ltr",
  defaultCountry: "IN",
  placeholder: "Enter phone number",
  enforceCustomSelect: false,
  enforceHtmlSelect: false,
  showFlag: false,
  showDialCode: false,
  enableSearch: true,
  searchPlaceholder: "Search",
  preferredCountries: [],
  highlightCountries: [],
  showValidityCallback: true,
  showSelectCallback: false,
};

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [s, setS] = useState<PlaygroundState>(initial);
  const [value, setValue] = useState("");
  const [validity, setValidity] = useState<PhoneValidityState | null>(null);
  const [copied, setCopied] = useState(false);

  function set<K extends keyof PlaygroundState>(
    key: K,
    val: PlaygroundState[K]
  ) {
    setS((prev) => ({ ...prev, [key]: val }));
  }

  function handleEnforceCustom(v: boolean) {
    setS((prev) => ({
      ...prev,
      enforceCustomSelect: v,
      enforceHtmlSelect: v ? false : prev.enforceHtmlSelect,
    }));
  }

  function handleEnforceHtml(v: boolean) {
    setS((prev) => ({
      ...prev,
      enforceHtmlSelect: v,
      enforceCustomSelect: v ? false : prev.enforceCustomSelect,
    }));
  }

  const options = useMemo(
    () => ({
      mode: s.mode,
      multiCountry: s.multiCountry,
      format: s.format,
      hideDialCode: s.hideDialCode,
      enableFlag: s.enableFlag,
      direction: s.direction,
      defaultCountry: s.defaultCountry || "IN",
      enforceCustomSelect: s.enforceCustomSelect,
      enforceHtmlSelect: s.enforceHtmlSelect,
      preferredCountries: s.preferredCountries,
      highlightCountries: s.highlightCountries,
      customSelect: {
        showFlag: s.showFlag,
        showDialCode: s.showDialCode,
        enableSearch: s.enableSearch,
        searchPlaceholder: s.searchPlaceholder || "Search",
      },
    }),
    [s]
  );

  const code = useMemo(() => generateCode(s), [s]);

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const validityBadge = (status: string) => {
    if (status === "valid") return "badge-valid";
    if (status === "unknown") return "badge-unknown";
    return "badge-invalid";
  };

  return (
    <div className="playground" data-testid="playground">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-title">
              react-intl-phone-username-input
            </span>
            <span className="header-sub">Interactive Playground</span>
          </div>
          <nav className="header-links">
            <a
              href="https://www.npmjs.com/package/react-intl-phone-username-input"
              target="_blank"
              rel="noreferrer"
              className="hbadge npm"
            >
              npm
            </a>
            <a
              href="https://github.com/usl-dev/react-intl-phone-username-input"
              target="_blank"
              rel="noreferrer"
              className="hbadge gh"
            >
              GitHub
            </a>
            <a
              href="https://upscalesoftwarelabs.vercel.app/package/react-intl-phone-username-input/"
              target="_blank"
              rel="noreferrer"
              className="hbadge docs"
            >
              Docs
            </a>
          </nav>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="main">
        {/* ── LEFT: controls ── */}
        <aside className="sidebar" data-testid="sidebar">
          <OptionGroup title="Core">
            <OptionRow label="mode" hint="phone | hybrid">
              <Segment
                name="mode"
                options={[
                  { label: "phone", value: "phone" },
                  { label: "hybrid", value: "hybrid" },
                ]}
                value={s.mode}
                onChange={(v) => {
                  set("mode", v);
                  setValue("");
                  setValidity(null);
                }}
              />
            </OptionRow>

            <OptionRow label="multiCountry" hint="show country selector">
              <Toggle
                testId="toggle-multiCountry"
                checked={s.multiCountry}
                onChange={(v) => set("multiCountry", v)}
              />
            </OptionRow>

            <OptionRow label="format" hint="as-you-type formatting">
              <Toggle
                testId="toggle-format"
                checked={s.format}
                onChange={(v) => set("format", v)}
              />
            </OptionRow>

            <OptionRow label="hideDialCode" hint="hide +XX from input">
              <Toggle
                testId="toggle-hideDialCode"
                checked={s.hideDialCode}
                onChange={(v) => set("hideDialCode", v)}
              />
            </OptionRow>

            <OptionRow
              label="enableFlag"
              hint="flag in single-country mode"
              disabled={s.multiCountry}
            >
              <Toggle
                testId="toggle-enableFlag"
                checked={s.multiCountry ? true : s.enableFlag}
                onChange={(v) => set("enableFlag", v)}
              />
            </OptionRow>

            <OptionRow label="direction" hint="ltr | rtl">
              <Segment
                name="direction"
                options={[
                  { label: "ltr →", value: "ltr" },
                  { label: "rtl ←", value: "rtl" },
                ]}
                value={s.direction}
                onChange={(v) => {
                  set("direction", v);
                  setValue("");
                }}
              />
            </OptionRow>

            <OptionRow label="defaultCountry" hint="ISO alpha-2 e.g. US">
              <input
                className="text-input"
                data-testid="input-defaultCountry"
                value={s.defaultCountry}
                maxLength={2}
                placeholder="IN"
                onChange={(e) => {
                  set("defaultCountry", e.target.value.toUpperCase().slice(0, 2));
                  setValue("");
                  setValidity(null);
                }}
              />
            </OptionRow>

            <OptionRow label="placeholder">
              <input
                className="text-input wide"
                data-testid="input-placeholder"
                value={s.placeholder}
                onChange={(e) => set("placeholder", e.target.value)}
              />
            </OptionRow>
          </OptionGroup>

          <OptionGroup title="Country Selector">
            <OptionRow
              label="enforceCustomSelect"
              hint="always use custom dropdown"
              disabled={!s.multiCountry}
            >
              <Toggle
                testId="toggle-enforceCustomSelect"
                checked={s.enforceCustomSelect}
                onChange={handleEnforceCustom}
              />
            </OptionRow>

            <OptionRow
              label="enforceHtmlSelect"
              hint="always use native <select>"
              disabled={!s.multiCountry}
            >
              <Toggle
                testId="toggle-enforceHtmlSelect"
                checked={s.enforceHtmlSelect}
                onChange={handleEnforceHtml}
              />
            </OptionRow>

            <OptionRow
              label="showFlag"
              hint="flags inside dropdown list"
              disabled={!s.multiCountry}
            >
              <Toggle
                testId="toggle-showFlag"
                checked={s.showFlag}
                onChange={(v) => set("showFlag", v)}
              />
            </OptionRow>

            <OptionRow
              label="showDialCode"
              hint="dial codes in dropdown list"
              disabled={!s.multiCountry}
            >
              <Toggle
                testId="toggle-showDialCode"
                checked={s.showDialCode}
                onChange={(v) => set("showDialCode", v)}
              />
            </OptionRow>

            <OptionRow
              label="enableSearch"
              hint="search box in dropdown"
              disabled={!s.multiCountry}
            >
              <Toggle
                testId="toggle-enableSearch"
                checked={s.enableSearch}
                onChange={(v) => set("enableSearch", v)}
              />
            </OptionRow>

            {s.enableSearch && s.multiCountry && (
              <OptionRow label="searchPlaceholder">
                <input
                  className="text-input wide"
                  data-testid="input-searchPlaceholder"
                  value={s.searchPlaceholder}
                  onChange={(e) => set("searchPlaceholder", e.target.value)}
                />
              </OptionRow>
            )}
          </OptionGroup>

          <OptionGroup title="Country Order">
            <OptionRow label="preferredCountries" hint="type + Enter to add">
              <TagInput
                testId="taginput-preferred"
                tags={s.preferredCountries}
                onChange={(v) => set("preferredCountries", v)}
                placeholder="GB, US …"
              />
            </OptionRow>
            <OptionRow label="highlightCountries" hint="pinned above preferred">
              <TagInput
                testId="taginput-highlight"
                tags={s.highlightCountries}
                onChange={(v) => set("highlightCountries", v)}
                placeholder="AE …"
              />
            </OptionRow>
          </OptionGroup>

          <OptionGroup title="Callbacks">
            <OptionRow
              label="onValidityChange"
              hint="track phone validity state"
            >
              <Toggle
                testId="toggle-onValidityChange"
                checked={s.showValidityCallback}
                onChange={(v) => {
                  set("showValidityCallback", v);
                  if (!v) setValidity(null);
                }}
              />
            </OptionRow>
            <OptionRow
              label="onChangeSelect"
              hint="fires on country change"
            >
              <Toggle
                testId="toggle-onChangeSelect"
                checked={s.showSelectCallback}
                onChange={(v) => set("showSelectCallback", v)}
              />
            </OptionRow>
          </OptionGroup>
        </aside>

        {/* ── RIGHT: preview + output + code ── */}
        <section className="preview-panel">
          <div className="preview-sticky">
            {/* Component preview */}
            <div className="card preview-card" data-testid="preview-card">
              <p className="card-label">Preview</p>
              <IntlPhoneUsernameInput
                data-testid="preview-input"
                value={value}
                onChange={setValue}
                onValidityChange={
                  s.showValidityCallback ? setValidity : undefined
                }
                onChangeSelect={
                  s.showSelectCallback
                    ? (change) => console.log("[onChangeSelect]", change)
                    : undefined
                }
                options={options}
                placeholder={s.placeholder}
              />
              {s.mode === "hybrid" && (
                <p className="hint-text" data-testid="hybrid-hint">
                  Try typing a username, email, or start with + for a phone
                  number.
                </p>
              )}
            </div>

            {/* Output display */}
            <div className="card output-card" data-testid="output-card">
              <p className="card-label">Output</p>
              <div className="output-grid">
                <span className="out-key">value</span>
                <span className="out-val" data-testid="output-value">
                  {value ? `"${value}"` : <em>—</em>}
                </span>

                {s.showValidityCallback && validity && (
                  <>
                    <span className="out-key">status</span>
                    <span
                      data-testid="output-status"
                      className={`out-val badge ${validityBadge(validity.status)}`}
                    >
                      {validity.status}
                    </span>

                    <span className="out-key">isValid</span>
                    <span
                      data-testid="output-isValid"
                      className={`out-val ${validity.isValid ? "bool-true" : "bool-false"}`}
                    >
                      {String(validity.isValid)}
                    </span>

                    <span className="out-key">isPossible</span>
                    <span
                      data-testid="output-isPossible"
                      className={`out-val ${validity.isPossible ? "bool-true" : "bool-false"}`}
                    >
                      {String(validity.isPossible)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Code snippet */}
            <div className="card code-card" data-testid="code-card">
              <div className="code-header">
                <span className="card-label" style={{ color: "#94a3b8" }}>
                  JSX
                </span>
                <button
                  type="button"
                  data-testid="copy-btn"
                  className={`copy-btn${copied ? " copied" : ""}`}
                  onClick={copyCode}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="code-block" data-testid="code-snippet">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
