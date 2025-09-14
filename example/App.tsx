import { useState } from "react";
import { IntlPhoneUsernameInput } from "../src";
import { Form, useField } from "informed";

function App() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>({});

  const handleSubmit = (value: any) => {
    console.log("Form submitted:", value);
    setDebugInfo({ ...debugInfo, formData: value });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <Form
        // initialValues={{ username: "johnDoe@gmail.com", phone: "+919847472776" }}
        onSubmit={handleSubmit}
      >
        <div style={{ marginBottom: "20px" }}>
          <h3>1. Phone-only with formatting (default)</h3>
          <IntlPhoneUsernameInput
            value={value1}
            onChange={setValue1}
            options={{
              // direction: "rtl",
              mode: "phone",
              defaultCountry: "US",
              multiCountry: true,
            }}
            placeholder="Enter phone number"
          />
          <p>Value: {value1}</p>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h3>2. Phone-only with formatting disabled</h3>
          <IntlPhoneUsernameInput
            value={value2}
            onChange={setValue2}
            options={{
              // direction: "rtl",
              mode: "phone",
              defaultCountry: "US",
              multiCountry: true,
              format: false,
              enforceCustomSelect: true,
              customSelect: {
                // showFlag: true,
                // showDialCode: true,
                enableSearch: true,
                searchPlaceholder: "Find your country...",
              },
            }}
            placeholder="Enter phone number"
          />
          <p>Value: {value2}</p>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h3>3. Hybrid mode (text/username + phone) with formatting</h3>
          <IntlPhoneUsernameInput
            name="username"
            value={value3}
            onChange={setValue3}
            options={{
              // direction: "rtl",
              mode: "hybrid", // Allows both text and phone numbers
              defaultCountry: "US",
              multiCountry: false,
              enableFlag: true,
            }}
            placeholder="Enter username or phone number"
          />
          <p>Value: {value3}</p>
          <p style={{ fontSize: "12px", color: "#666" }}>
            Try typing: "john@example.com", "1234567890", or "+1234567890"
          </p>
        </div>
        <br />
        <InputField
          placeholder="phone"
          name="phone"
          options={{
            defaultCountry: "QA",
            enableFlag: false,
            mode: "phone",
            hideDialCode: true, // this works only if multiCountry is false
            format: false,
            // direction: "rtl",
            // customSelect: {
            //   showFlag: true,
            //   showDialCode: true,
            //   enableSearch: true,
            //   searchPlaceholder: "Find your country...",
            // },
            // enforceHtmlSelect: true,
            // enforceCustomSelect: true,
            // multiCountry: true,
            // preferredCountries: ["IN", "US", "SA"],
            // highLightCountries: ["QA"],
            // classes: {
            //   flag_container: "",
            //   flag: "",
            //   custom_select: {
            //     country_list_item: "",
            //     country_option: "",
            //     flag: "",
            //     select_container: "",
            //     select_overlay_btn: "",
            //     list_flag: "",
            //     arrow: "",
            //     country_list: "",
            //   },
            //   html_select: {
            //     html_select_container: "",
            //     select_wrapper: "",
            //     select_overlay: "",
            //     flag: "",
            //     arrow: "",
            //   },
            //   intlPhoneUsernameInputWrapper: "",
            //   input_box: "",
            // },
            // customArrowIcon: <div>Arrow</div>,
          }}
        />
        <br />
        <button type="submit">Submit</button>
      </Form>
      {JSON.stringify(debugInfo, null, 2)}
    </div>
  );
}

export default App;

const InputField = (props: any) => {
  const { fieldState, fieldApi, userProps } = useField(props);
  const { value } = fieldState;
  const { setValue } = fieldApi;

  return (
    <IntlPhoneUsernameInput
      value={value as string}
      onChange={(value: string) => setValue(value)}
      // onChangeSelect={(value: string) => console.log("Selected:", value)}
      {...userProps}
    />
  );
};
