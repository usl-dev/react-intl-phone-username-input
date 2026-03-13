import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IntlPhoneUsernameInput from "./IntlPhoneUsernameInput";

describe("IntlPhoneUsernameInput", () => {
  it("renders an input with placeholder", async () => {
    const onChange = vi.fn();
    render(
      <IntlPhoneUsernameInput
        value=""
        onChange={onChange}
        placeholder="Enter phone"
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter phone")).toBeInTheDocument();
    });
  });

  it("displays the controlled value", async () => {
    const onChange = vi.fn();
    render(
      <IntlPhoneUsernameInput
        value="+91 98765 43210"
        onChange={onChange}
        placeholder="Phone"
      />
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText("Phone");
      expect(input).toHaveValue("+91 98765 43210");
    });
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <IntlPhoneUsernameInput
        value=""
        onChange={onChange}
        placeholder="Phone"
        options={{ mode: "phone", defaultCountry: "IN", multiCountry: false }}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Phone")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Phone");
    await user.type(input, "9");

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it("renders with hybrid mode and single country", async () => {
    const onChange = vi.fn();
    render(
      <IntlPhoneUsernameInput
        value=""
        onChange={onChange}
        options={{
          mode: "hybrid",
          defaultCountry: "US",
          multiCountry: false,
          enableFlag: true,
        }}
        placeholder="Username or phone"
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Username or phone")).toBeInTheDocument();
    });
  });

  it("renders with multiCountry true (lazy select)", async () => {
    const onChange = vi.fn();
    render(
      <IntlPhoneUsernameInput
        value="+1 "
        onChange={onChange}
        options={{
          mode: "phone",
          defaultCountry: "US",
          multiCountry: true,
        }}
        placeholder="Phone"
      />
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText("Phone");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("+1 ");
    }, { timeout: 3000 });
  });

  it("keeps the native select visible on initial render with an empty controlled value", async () => {
    render(
      <IntlPhoneUsernameInput
        value=""
        onChange={vi.fn()}
        options={{
          mode: "phone",
          defaultCountry: "US",
          multiCountry: true,
          enforceHtmlSelect: true,
          enforceCustomSelect: false,
        }}
        placeholder="Phone"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Phone")).toHaveValue("+1 ");
    });
  });

  it("keeps the custom select visible on initial render with an empty controlled value", async () => {
    render(
      <IntlPhoneUsernameInput
        value=""
        onChange={vi.fn()}
        options={{
          mode: "phone",
          defaultCountry: "US",
          multiCountry: true,
          enforceCustomSelect: true,
          enforceHtmlSelect: false,
          customSelect: {
            enableSearch: false,
          },
        }}
        placeholder="Phone"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /select country, currently united states/i })
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Phone")).toHaveValue("+1 ");
    });
  });

  it("accepts and displays value in hideDialCode mode", async () => {
    const onChange = vi.fn();
    render(
      <IntlPhoneUsernameInput
        value="9876543210"
        onChange={onChange}
        options={{
          mode: "phone",
          defaultCountry: "IN",
          multiCountry: false,
          hideDialCode: true,
        }}
        placeholder="Phone"
      />
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText("Phone");
      expect(input).toHaveValue("9876543210");
    });
  });

  it("applies rtl direction to the underlying input", async () => {
    render(
      <IntlPhoneUsernameInput
        value=""
        onChange={vi.fn()}
        options={{
          mode: "phone",
          direction: "rtl",
        }}
        placeholder="Phone"
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Phone")).toHaveAttribute("dir", "rtl");
    });
  });

  it("hides the single-country flag when enableFlag is false", async () => {
    const { container } = render(
      <IntlPhoneUsernameInput
        value="+1 "
        onChange={vi.fn()}
        options={{
          mode: "phone",
          defaultCountry: "US",
          multiCountry: false,
          enableFlag: false,
        }}
        placeholder="Phone"
      />
    );

    await waitFor(() => {
      expect(container.querySelector('[data-component="flag"]')).toBeNull();
    });
  });

  it("passes through input props like disabled and required", async () => {
    const onChange = vi.fn();
    render(
      <IntlPhoneUsernameInput
        value=""
        onChange={onChange}
        placeholder="Phone"
        disabled
        required
      />
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText("Phone");
      expect(input).toBeDisabled();
      expect(input).toBeRequired();
    });
  });

  it("supports hybrid mode for plain text input", async () => {
    const user = userEvent.setup();

    const TestHarness = () => {
      const [value, setValue] = React.useState("");

      return (
        <IntlPhoneUsernameInput
          value={value}
          onChange={setValue}
          options={{
            mode: "hybrid",
            defaultCountry: "US",
            multiCountry: false,
          }}
          placeholder="Username or phone"
        />
      );
    };

    render(<TestHarness />);

    const input = await screen.findByPlaceholderText("Username or phone");
    await user.type(input, "john@example.com");

    await waitFor(() => {
      expect(input).toHaveValue("john@example.com");
    });
  });

  it("keeps phone mode unformatted when format is disabled", async () => {
    const user = userEvent.setup();

    const TestHarness = () => {
      const [value, setValue] = React.useState("+1 ");

      return (
        <IntlPhoneUsernameInput
          value={value}
          onChange={setValue}
          options={{
            mode: "phone",
            defaultCountry: "US",
            multiCountry: false,
            format: false,
          }}
          placeholder="Phone"
        />
      );
    };

    render(<TestHarness />);

    const input = await screen.findByPlaceholderText("Phone");
    await user.type(input, "2345678");

    await waitFor(() => {
      expect(input).toHaveValue("+1 2345678");
    });
  });

  it("uses highlightCountries and preferredCountries to order native select options", async () => {
    render(
      <IntlPhoneUsernameInput
        value="+1 "
        onChange={vi.fn()}
        options={{
          mode: "phone",
          defaultCountry: "US",
          multiCountry: true,
          enforceHtmlSelect: true,
          enforceCustomSelect: false,
          preferredCountries: ["GB", "IN"],
          highlightCountries: ["AE"],
        }}
        placeholder="Phone"
      />
    );

    const select = (await screen.findByRole("combobox")) as HTMLSelectElement;

    await waitFor(() => {
      const orderedValues = Array.from(select.options)
        .slice(0, 3)
        .map((option) => option.value);

      expect(orderedValues).toEqual(["AE", "GB", "IN"]);
    });
  });

  it("uses the configured flagBaseUrl for rendered flags", async () => {
    render(
      <IntlPhoneUsernameInput
        value="+1 "
        onChange={vi.fn()}
        options={{
          mode: "phone",
          defaultCountry: "US",
          multiCountry: false,
          enableFlag: true,
          flagBaseUrl: "/flags",
        }}
        placeholder="Phone"
      />
    );

    const flag = await screen.findByRole("img", { name: /united states/i });
    expect(flag).toHaveAttribute("src", expect.stringContaining("/flags/us.svg"));
  });

  it("forwards the input ref", async () => {
    const ref = React.createRef<HTMLInputElement>();

    render(
      <IntlPhoneUsernameInput
        ref={ref}
        value=""
        onChange={vi.fn()}
        placeholder="Phone"
      />
    );

    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toHaveAttribute("placeholder", "Phone");
    });
  });

  it("passes selectFieldName to the native select and emits a stable payload", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onChangeSelect = vi.fn();

    render(
      <IntlPhoneUsernameInput
        value="+1 "
        onChange={onChange}
        onChangeSelect={onChangeSelect}
        selectFieldName="country_code"
        options={{
          mode: "phone",
          defaultCountry: "US",
          multiCountry: true,
          enforceHtmlSelect: true,
          enforceCustomSelect: false,
        }}
        placeholder="Phone"
      />
    );

    const select = await screen.findByRole("combobox");
    expect(select).toHaveAttribute("name", "country_code");

    await user.selectOptions(select, "IN");

    await waitFor(() => {
      expect(onChangeSelect).toHaveBeenCalledWith({
        countryCode: "IN",
        dialCode: "+91",
        label: "India",
        name: "country_code",
        source: "native-select",
      });
    });
  });

  it("emits a stable payload for the custom select and keeps a hidden field for forms", async () => {
    const user = userEvent.setup();
    const onChangeSelect = vi.fn();
    const TestHarness = () => {
      const [value, setValue] = React.useState("+1 ");

      return (
        <IntlPhoneUsernameInput
          value={value}
          onChange={setValue}
          onChangeSelect={onChangeSelect}
          selectFieldName="country_code"
          options={{
            mode: "phone",
            defaultCountry: "US",
            multiCountry: true,
            enforceCustomSelect: true,
            enforceHtmlSelect: false,
            customSelect: {
              enableSearch: false,
            },
          }}
          placeholder="Phone"
        />
      );
    };

    const { container } = render(<TestHarness />);

    let hiddenInput: HTMLInputElement | null = null;

    await waitFor(() => {
      hiddenInput = container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="country_code"]'
      );
      expect(hiddenInput).not.toBeNull();
      expect(hiddenInput).toHaveValue("US");
    });

    await user.click(
      await screen.findByRole("button", { name: /select country/i })
    );
    await user.click(await screen.findByRole("option", { name: /^india$/i }));

    await waitFor(() => {
      expect(onChangeSelect).toHaveBeenCalledWith({
        countryCode: "IN",
        dialCode: "+91",
        label: "India",
        name: "country_code",
        source: "custom-select",
      });
      expect(hiddenInput).toHaveValue("IN");
    });
  });
});
