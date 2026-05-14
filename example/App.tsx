import React, { useState, useMemo } from "react";
import {
  IntlPhoneUsernameInput,
  type PhoneValidityState,
} from "../src";

const defaultCountry = "IN";

function App() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  const [value4, setValue4] = useState("");
  const [value5, setValue5] = useState("");
  const [validity1, setValidity1] = useState<PhoneValidityState | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, string> | null>(null);

  const options1 = useMemo(
    () => ({
      mode: "phone" as const,
      defaultCountry,
      multiCountry: true,
      enforceCustomSelect: true,
    }),
    []
  );
  const options2 = useMemo(
    () => ({
      mode: "phone" as const,
      defaultCountry,
      multiCountry: true,
      format: false,
      enforceCustomSelect: true,
      customSelect: {
        enableSearch: true,
        searchPlaceholder: "Find your country...",
        showFlag: true,
        showDialCode: true,
      },
    }),
    []
  );
  const options3 = useMemo(
    () => ({
      mode: "hybrid" as const,
      defaultCountry,
      multiCountry: true,
      enableFlag: true,
    }),
    []
  );
  const options4 = useMemo(
    () => ({
      defaultCountry,
      enableFlag: false,
      mode: "phone" as const,
      hideDialCode: true,
      format: false,
      multiCountry: false,
    }),
    []
  );
  const options5 = useMemo(
    () => ({
      mode: "phone" as const,
      defaultCountry: "AE",
      multiCountry: true,
      direction: "rtl" as const,
    }),
    []
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted({
      phone1: value1,
      phone2: value2,
      hybrid: value3,
      phoneHideDial: value4,
      rtl: value5,
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", fontFamily: "sans-serif" }}>
      <form onSubmit={handleSubmit} noValidate>

        {/* ── 1. Phone-only with formatting ─────────────────────────────────── */}
        <div style={{ marginBottom: "28px" }} data-testid="section-phone-format">
          <h3>1. Phone-only with formatting + onValidityChange</h3>
          <IntlPhoneUsernameInput
            data-testid="input-phone-format"
            value={value1}
            onChange={setValue1}
            onValidityChange={setValidity1}
            options={options1}
            placeholder="Enter phone number"
          />
          <p data-testid="value-phone-format">Value: {value1}</p>
          {validity1 && (
            <p data-testid="validity-status">
              Validity: {validity1.status} | isValid:{" "}
              {String(validity1.isValid)} | isPossible:{" "}
              {String(validity1.isPossible)}
            </p>
          )}
        </div>

        {/* ── 2. Phone, no format, custom select ────────────────────────────── */}
        <div style={{ marginBottom: "28px" }} data-testid="section-custom-select">
          <h3>2. Phone, no format, custom select (search + flags + dial codes)</h3>
          <IntlPhoneUsernameInput
            data-testid="input-custom-select"
            value={value2}
            onChange={setValue2}
            options={options2}
            placeholder="Enter phone number"
          />
          <p data-testid="value-custom-select">Value: {value2}</p>
        </div>

        {/* ── 3. Hybrid mode ────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "28px" }} data-testid="section-hybrid">
          <h3>3. Hybrid mode (username or phone)</h3>
          <IntlPhoneUsernameInput
            data-testid="input-hybrid"
            value={value3}
            onChange={setValue3}
            options={options3}
            placeholder="Enter username or phone number"
          />
          <p data-testid="value-hybrid">Value: {value3}</p>
          <p style={{ fontSize: "12px", color: "#666" }}>
            Try: &quot;john&quot;, &quot;john@example.com&quot;, or &quot;+919876543210&quot;
          </p>
        </div>

        {/* ── 4. Hide dial code ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: "28px" }} data-testid="section-hide-dial">
          <h3>4. Phone, single country, hide dial code</h3>
          <IntlPhoneUsernameInput
            data-testid="input-hide-dial"
            value={value4}
            onChange={setValue4}
            options={options4}
            placeholder="Phone number"
          />
          <p data-testid="value-hide-dial">Value: {value4}</p>
        </div>

        {/* ── 5. RTL ────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "28px" }} data-testid="section-rtl">
          <h3>5. RTL — UAE (direction: rtl)</h3>
          <IntlPhoneUsernameInput
            data-testid="input-rtl"
            value={value5}
            onChange={setValue5}
            options={options5}
            placeholder="أدخل رقم الهاتف"
          />
          <p data-testid="value-rtl">Value: {value5}</p>
        </div>

        <button type="submit" data-testid="submit-btn">Submit</button>
      </form>

      {submitted && (
        <pre
          data-testid="submitted-output"
          style={{ marginTop: "20px", fontSize: "12px", overflow: "auto" }}
        >
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
