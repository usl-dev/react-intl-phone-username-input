import React, { useState } from "react";
import { IntlPhoneUsernameInput } from "../src";

const defaultCountry = "IN";

function App() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  const [value4, setValue4] = useState("");
  const [submitted, setSubmitted] = useState<Record<string, string> | null>(
    null,
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted({
      phone1: value1,
      phone2: value2,
      hybrid: value3,
      phoneHideDial: value4,
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <h3>1. Phone-only with formatting (default)</h3>
          <IntlPhoneUsernameInput
            value={value1}
            onChange={setValue1}
            options={{
              mode: "phone",
              defaultCountry,
              multiCountry: true,
            }}
            placeholder="Enter phone number"
          />
          <p>Value: {value1}</p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3>2. Phone-only, no format, custom select</h3>
          <IntlPhoneUsernameInput
            value={value2}
            onChange={setValue2}
            options={{
              mode: "phone",
              defaultCountry,
              multiCountry: true,
              format: false,
              enforceCustomSelect: true,
              customSelect: {
                enableSearch: true,
                searchPlaceholder: "Find your country...",
                showFlag: true,
              },
            }}
            placeholder="Enter phone number"
          />
          <p>Value: {value2}</p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3>3. Hybrid mode (username or phone)</h3>
          <IntlPhoneUsernameInput
            value={value3}
            onChange={setValue3}
            options={{
              mode: "hybrid",
              defaultCountry,
              multiCountry: true,
              enableFlag: true,
            }}
            placeholder="Enter username or phone number"
          />
          <p>Value: {value3}</p>
          <p style={{ fontSize: "12px", color: "#666" }}>
            Try: &quot;john@example.com&quot;, &quot;1234567890&quot;, or
            &quot;+1234567890&quot;
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3>4. Phone, single country, hide dial code</h3>
          <IntlPhoneUsernameInput
            value={value4}
            onChange={setValue4}
            options={{
              defaultCountry,
              enableFlag: false,
              mode: "phone",
              hideDialCode: true,
              format: false,
              multiCountry: false,
            }}
            placeholder="Phone number"
          />
          <p>Value: {value4}</p>
        </div>

        <button type="submit">Submit</button>
      </form>

      {submitted && (
        <pre style={{ marginTop: "20px", fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
