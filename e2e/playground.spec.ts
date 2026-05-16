import { test, expect, Page } from "@playwright/test";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const previewInput = (page: Page) =>
  page.locator('[data-testid="preview-input"]');

const customSelectTrigger = (page: Page) =>
  page
    .locator('[data-testid="preview-card"] [data-component="custom-select"] button[aria-haspopup="listbox"]')
    .first();

const listbox = (page: Page) =>
  page.locator('[data-testid="preview-card"] [role="listbox"]');

const nativeSelect = (page: Page) =>
  page.locator('[data-testid="preview-card"] select');

// The checkbox inside Toggle is visually hidden (opacity:0, width:0, height:0).
// Click the visible <label> wrapper instead to toggle it correctly.
const check = async (page: Page, id: string) => {
  const input = page.locator(`[data-testid="toggle-${id}"]`);
  if (!await input.isChecked())
    await page.locator(`label:has([data-testid="toggle-${id}"])`).click();
};

const uncheck = async (page: Page, id: string) => {
  const input = page.locator(`[data-testid="toggle-${id}"]`);
  if (await input.isChecked())
    await page.locator(`label:has([data-testid="toggle-${id}"])`).click();
};

const toggle = (page: Page, id: string) =>
  page.locator(`[data-testid="toggle-${id}"]`);

const seg = (page: Page, name: string, value: string) =>
  page.locator(`[data-testid="seg-${name}-${value}"]`);

const outputValue = (page: Page) =>
  page.locator('[data-testid="output-value"]');

const outputStatus = (page: Page) =>
  page.locator('[data-testid="output-status"]');

const outputIsValid = (page: Page) =>
  page.locator('[data-testid="output-isValid"]');

const outputIsPossible = (page: Page) =>
  page.locator('[data-testid="output-isPossible"]');

const codeSnippet = (page: Page) =>
  page.locator('[data-testid="code-snippet"]');

// ─── Setup ────────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('[data-testid="playground"]');
  // wait for lazy-loaded country list / custom-select to mount
  await page
    .locator('[data-component="custom-select"]')
    .first()
    .waitFor({ state: "visible", timeout: 15000 });
});

// ═════════════════════════════════════════════════════════════════════════════
// 1. Initial render
// ═════════════════════════════════════════════════════════════════════════════

test.describe("1. Initial render", () => {
  test("playground shell is visible", async ({ page }) => {
    await expect(page.locator('[data-testid="playground"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-card"]')).toBeVisible();
  });

  test("phone input is rendered in the preview", async ({ page }) => {
    await expect(previewInput(page)).toBeVisible();
  });

  test("country selector trigger is visible by default (multiCountry=true)", async ({ page }) => {
    await expect(customSelectTrigger(page)).toBeVisible();
  });

  test("output value starts empty", async ({ page }) => {
    await expect(outputValue(page)).toContainText("—");
  });

  test("code snippet is rendered", async ({ page }) => {
    await expect(codeSnippet(page)).toBeVisible();
    await expect(codeSnippet(page)).toContainText("IntlPhoneUsernameInput");
  });

  test("placeholder defaults to 'Enter phone number'", async ({ page }) => {
    await expect(previewInput(page)).toHaveAttribute("placeholder", "Enter phone number");
  });

  test("header links are present", async ({ page }) => {
    await expect(page.locator(".hbadge.npm")).toBeVisible();
    await expect(page.locator(".hbadge.gh")).toBeVisible();
    await expect(page.locator(".hbadge.docs")).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. mode toggle
// ═════════════════════════════════════════════════════════════════════════════

test.describe("2. mode toggle", () => {
  test("default is phone — no hybrid hint", async ({ page }) => {
    await expect(page.locator('[data-testid="hybrid-hint"]')).not.toBeVisible();
  });

  test("switching to hybrid shows hint text", async ({ page }) => {
    await seg(page, "mode", "hybrid").click();
    await expect(page.locator('[data-testid="hybrid-hint"]')).toBeVisible();
  });

  test("hybrid mode accepts plain text without + prefix", async ({ page }) => {
    await seg(page, "mode", "hybrid").click();
    await previewInput(page).fill("johnsmith");
    await expect(outputValue(page)).toContainText("johnsmith");
  });

  test("hybrid mode accepts email", async ({ page }) => {
    await seg(page, "mode", "hybrid").click();
    await previewInput(page).fill("john@example.com");
    await expect(outputValue(page)).toContainText("john@example.com");
  });

  test("hybrid mode formats value starting with +", async ({ page }) => {
    await seg(page, "mode", "hybrid").click();
    await previewInput(page).fill("+919876543210");
    const val = await previewInput(page).inputValue();
    expect(val).toContain("+91");
  });

  test("phone mode has numeric inputmode", async ({ page }) => {
    await expect(previewInput(page)).toHaveAttribute("inputmode", "numeric");
  });

  test("switching back to phone clears hybrid hint", async ({ page }) => {
    await seg(page, "mode", "hybrid").click();
    await seg(page, "mode", "phone").click();
    await expect(page.locator('[data-testid="hybrid-hint"]')).not.toBeVisible();
  });

  test("code snippet contains mode:phone when phone is selected", async ({ page }) => {
    await expect(codeSnippet(page)).toContainText('mode: "phone"');
  });

  test("code snippet omits mode when hybrid (default)", async ({ page }) => {
    await seg(page, "mode", "hybrid").click();
    await expect(codeSnippet(page)).not.toContainText('mode:');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. multiCountry toggle
// ═════════════════════════════════════════════════════════════════════════════

test.describe("3. multiCountry toggle", () => {
  test("country selector is visible when multiCountry=true (default)", async ({ page }) => {
    await expect(customSelectTrigger(page)).toBeVisible();
  });

  test("turning off multiCountry hides the country selector", async ({ page }) => {
    await uncheck(page, "multiCountry");
    await expect(customSelectTrigger(page)).not.toBeVisible();
    await expect(nativeSelect(page)).not.toBeVisible();
  });

  test("code snippet includes multiCountry:true when on", async ({ page }) => {
    await expect(codeSnippet(page)).toContainText("multiCountry: true");
  });

  test("code snippet omits multiCountry when off", async ({ page }) => {
    await uncheck(page, "multiCountry");
    await expect(codeSnippet(page)).not.toContainText("multiCountry");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. format toggle
// ═════════════════════════════════════════════════════════════════════════════

test.describe("4. format toggle", () => {
  test("with format on, typed digits include spaces", async ({ page }) => {
    await previewInput(page).click();
    await previewInput(page).type("9876543210");
    const val = await previewInput(page).inputValue();
    expect(val).toMatch(/\s/);
  });

  test("with format off, typed digits have no spaces", async ({ page }) => {
    await uncheck(page, "format");
    await previewInput(page).click();
    await previewInput(page).type("9876543210");
    const val = await previewInput(page).inputValue();
    // strip dial code + optional separator, then confirm no internal spaces
    const digits = val.replace(/^\+\d+\s?/, "");
    expect(digits).not.toMatch(/\s/);
  });

  test("code snippet includes format:false when off", async ({ page }) => {
    await uncheck(page, "format");
    await expect(codeSnippet(page)).toContainText("format: false");
  });

  test("code snippet omits format when on (default)", async ({ page }) => {
    await expect(codeSnippet(page)).not.toContainText("format:");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. hideDialCode toggle
// ═════════════════════════════════════════════════════════════════════════════

test.describe("5. hideDialCode toggle", () => {
  test("with hideDialCode off, value contains + prefix", async ({ page }) => {
    await previewInput(page).click();
    await previewInput(page).type("9876543210");
    const val = await previewInput(page).inputValue();
    expect(val).toContain("+");
  });

  test("with hideDialCode on, value has no + prefix", async ({ page }) => {
    await check(page, "hideDialCode");
    await previewInput(page).click();
    await previewInput(page).type("9876543210");
    const val = await previewInput(page).inputValue();
    expect(val).not.toContain("+");
  });

  test("code snippet includes hideDialCode:true when on", async ({ page }) => {
    await check(page, "hideDialCode");
    await expect(codeSnippet(page)).toContainText("hideDialCode: true");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. direction toggle (RTL)
// ═════════════════════════════════════════════════════════════════════════════

test.describe("6. direction toggle", () => {
  test("default direction is ltr — no rtl class on container", async ({ page }) => {
    const container = page
      .locator('[data-testid="preview-card"] [class*="container"]')
      .first();
    await expect(container).not.toHaveClass(/rtl/);
  });

  test("switching to rtl adds rtl class to container", async ({ page }) => {
    await seg(page, "direction", "rtl").click();
    const container = page
      .locator('[data-testid="preview-card"] [class*="container"]')
      .first();
    await expect(container).toHaveClass(/rtl/);
  });

  test("rtl input has dir=rtl attribute", async ({ page }) => {
    await seg(page, "direction", "rtl").click();
    await expect(previewInput(page)).toHaveAttribute("dir", "rtl");
  });

  test("code snippet includes direction:rtl when rtl selected", async ({ page }) => {
    await seg(page, "direction", "rtl").click();
    await expect(codeSnippet(page)).toContainText('direction: "rtl"');
  });

  test("code snippet omits direction when ltr (default)", async ({ page }) => {
    await expect(codeSnippet(page)).not.toContainText("direction:");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 7. defaultCountry input
// ═════════════════════════════════════════════════════════════════════════════

test.describe("7. defaultCountry input", () => {
  test("changing to US sets +1 prefix when typing", async ({ page }) => {
    const countryInput = page.locator('[data-testid="input-defaultCountry"]');
    await countryInput.fill("US");
    await previewInput(page).click();
    await previewInput(page).type("2025551234");
    const val = await previewInput(page).inputValue();
    expect(val).toContain("+1");
  });

  test("code snippet reflects new defaultCountry", async ({ page }) => {
    await page.locator('[data-testid="input-defaultCountry"]').fill("US");
    await expect(codeSnippet(page)).toContainText('defaultCountry: "US"');
  });

  test("code snippet omits defaultCountry when IN (default)", async ({ page }) => {
    await expect(codeSnippet(page)).not.toContainText("defaultCountry:");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 8. placeholder input
// ═════════════════════════════════════════════════════════════════════════════

test.describe("8. placeholder input", () => {
  test("changing placeholder updates the preview input placeholder", async ({ page }) => {
    const placeholderInput = page.locator('[data-testid="input-placeholder"]');
    await placeholderInput.fill("Your phone number");
    await expect(previewInput(page)).toHaveAttribute("placeholder", "Your phone number");
  });

  test("custom placeholder appears in code snippet", async ({ page }) => {
    await page.locator('[data-testid="input-placeholder"]').fill("Your phone");
    await expect(codeSnippet(page)).toContainText('placeholder="Your phone"');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 9. enforceCustomSelect toggle
// ═════════════════════════════════════════════════════════════════════════════

test.describe("9. enforceCustomSelect toggle", () => {
  test("enabling enforceCustomSelect renders custom dropdown trigger", async ({ page }) => {
    await check(page, "enforceCustomSelect");
    await expect(customSelectTrigger(page)).toBeVisible();
  });

  test("enabling enforceCustomSelect turns off enforceHtmlSelect", async ({ page }) => {
    // first enable html select
    await check(page, "enforceHtmlSelect");
    await expect(toggle(page, "enforceHtmlSelect")).toBeChecked();
    // now enable custom — html should auto-uncheck
    await check(page, "enforceCustomSelect");
    await expect(toggle(page, "enforceHtmlSelect")).not.toBeChecked();
  });

  test("code snippet includes enforceCustomSelect:true", async ({ page }) => {
    await check(page, "enforceCustomSelect");
    await expect(codeSnippet(page)).toContainText("enforceCustomSelect: true");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 10. enforceHtmlSelect toggle
// ═════════════════════════════════════════════════════════════════════════════

test.describe("10. enforceHtmlSelect toggle", () => {
  test("enabling enforceHtmlSelect renders a native select", async ({ page }) => {
    await check(page, "enforceHtmlSelect");
    await expect(nativeSelect(page)).toBeVisible();
  });

  test("enabling enforceHtmlSelect hides the custom dropdown trigger", async ({ page }) => {
    await check(page, "enforceHtmlSelect");
    await expect(customSelectTrigger(page)).not.toBeVisible();
  });

  test("enabling enforceHtmlSelect turns off enforceCustomSelect", async ({ page }) => {
    await check(page, "enforceCustomSelect");
    await check(page, "enforceHtmlSelect");
    await expect(toggle(page, "enforceCustomSelect")).not.toBeChecked();
  });

  test("code snippet includes enforceHtmlSelect:true", async ({ page }) => {
    await check(page, "enforceHtmlSelect");
    await expect(codeSnippet(page)).toContainText("enforceHtmlSelect: true");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 11. showFlag in dropdown
// ═════════════════════════════════════════════════════════════════════════════

test.describe("11. showFlag (dropdown list)", () => {
  test("opening dropdown when showFlag=on shows flag images in options", async ({ page }) => {
    await check(page, "showFlag");
    await customSelectTrigger(page).click();
    const lb = listbox(page);
    await expect(lb).toBeVisible();
    const firstOption = lb.locator('[role="option"]').first();
    await expect(firstOption.locator("img")).toBeVisible();
  });

  test("code snippet includes showFlag:true", async ({ page }) => {
    await check(page, "showFlag");
    await expect(codeSnippet(page)).toContainText("showFlag: true");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 12. showDialCode in dropdown
// ═════════════════════════════════════════════════════════════════════════════

test.describe("12. showDialCode (dropdown list)", () => {
  test("opening dropdown when showDialCode=on shows +XX in option text", async ({ page }) => {
    await check(page, "showDialCode");
    await customSelectTrigger(page).click();
    const firstOption = listbox(page).locator('[role="option"]').first();
    await expect(firstOption).toContainText("+");
  });

  test("code snippet includes showDialCode:true", async ({ page }) => {
    await check(page, "showDialCode");
    await expect(codeSnippet(page)).toContainText("showDialCode: true");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 13. enableSearch toggle
// ═════════════════════════════════════════════════════════════════════════════

test.describe("13. enableSearch toggle", () => {
  test("search input is visible in dropdown when enableSearch=true (default)", async ({ page }) => {
    await customSelectTrigger(page).click();
    await expect(
      page.locator('[data-testid="preview-card"] [aria-label="Search countries"]')
    ).toBeVisible();
  });

  test("turning off enableSearch hides the search input", async ({ page }) => {
    await uncheck(page, "enableSearch");
    await customSelectTrigger(page).click();
    await expect(
      page.locator('[data-testid="preview-card"] [aria-label="Search countries"]')
    ).not.toBeVisible();
  });

  test("code snippet includes enableSearch:false when off", async ({ page }) => {
    await uncheck(page, "enableSearch");
    await expect(codeSnippet(page)).toContainText("enableSearch: false");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 14. searchPlaceholder input
// ═════════════════════════════════════════════════════════════════════════════

test.describe("14. searchPlaceholder input", () => {
  test("custom searchPlaceholder appears in the search input", async ({ page }) => {
    await page.locator('[data-testid="input-searchPlaceholder"]').fill("Find country…");
    await customSelectTrigger(page).click();
    const search = page.locator('[data-testid="preview-card"] [aria-label="Search countries"]');
    await expect(search).toHaveAttribute("placeholder", "Find country…");
  });

  test("custom searchPlaceholder appears in code snippet", async ({ page }) => {
    await page.locator('[data-testid="input-searchPlaceholder"]').fill("Find country…");
    await expect(codeSnippet(page)).toContainText('searchPlaceholder: "Find country…"');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 15. preferredCountries tag input
// ═════════════════════════════════════════════════════════════════════════════

test.describe("15. preferredCountries tag input", () => {
  test("adding a country tag displays it in the sidebar", async ({ page }) => {
    const tagInput = page.locator('[data-testid="taginput-preferred"]');
    await tagInput.fill("GB");
    await tagInput.press("Enter");
    await expect(page.locator('.tag').filter({ hasText: "GB" }).first()).toBeVisible();
  });

  test("added country appears near top of dropdown list", async ({ page }) => {
    const tagInput = page.locator('[data-testid="taginput-preferred"]');
    await tagInput.fill("US");
    await tagInput.press("Enter");
    await customSelectTrigger(page).click();
    const firstFewOptions = listbox(page).locator('[role="option"]').first();
    await expect(firstFewOptions).toContainText("United States");
  });

  test("removing a tag removes it from the sidebar", async ({ page }) => {
    const tagInput = page.locator('[data-testid="taginput-preferred"]');
    await tagInput.fill("GB");
    await tagInput.press("Enter");
    await page.locator('[data-testid="tag-remove-GB"]').click();
    await expect(page.locator('.tag').filter({ hasText: "GB" })).toHaveCount(0);
  });

  test("code snippet includes preferredCountries", async ({ page }) => {
    const tagInput = page.locator('[data-testid="taginput-preferred"]');
    await tagInput.fill("US");
    await tagInput.press("Enter");
    await expect(codeSnippet(page)).toContainText('preferredCountries: ["US"]');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 16. highlightCountries tag input
// ═════════════════════════════════════════════════════════════════════════════

test.describe("16. highlightCountries tag input", () => {
  test("adding a highlight country tag displays it", async ({ page }) => {
    const tagInput = page.locator('[data-testid="taginput-highlight"]');
    await tagInput.fill("AE");
    await tagInput.press("Enter");
    await expect(page.locator('.tag').filter({ hasText: "AE" }).first()).toBeVisible();
  });

  test("code snippet includes highlightCountries", async ({ page }) => {
    const tagInput = page.locator('[data-testid="taginput-highlight"]');
    await tagInput.fill("DE");
    await tagInput.press("Enter");
    await expect(codeSnippet(page)).toContainText('highlightCountries: ["DE"]');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 17. onValidityChange callback toggle
// ═════════════════════════════════════════════════════════════════════════════

test.describe("17. onValidityChange toggle", () => {
  test("validity output appears after typing partial number (callback on)", async ({ page }) => {
    await previewInput(page).click();
    await previewInput(page).type("987");
    await expect(outputStatus(page)).toBeVisible();
    await expect(outputStatus(page)).toContainText("too_short");
  });

  test("validity output shows valid after complete number", async ({ page }) => {
    await previewInput(page).click();
    await previewInput(page).type("9876543210");
    await expect(outputStatus(page)).toContainText("valid");
    await expect(outputIsValid(page)).toContainText("true");
    await expect(outputIsPossible(page)).toContainText("true");
  });

  test("turning off onValidityChange hides validity output", async ({ page }) => {
    await uncheck(page, "onValidityChange");
    await previewInput(page).click();
    await previewInput(page).type("9876543210");
    await expect(outputStatus(page)).not.toBeVisible();
  });

  test("code snippet includes onValidityChange when on", async ({ page }) => {
    await expect(codeSnippet(page)).toContainText("onValidityChange");
  });

  test("code snippet omits onValidityChange when off", async ({ page }) => {
    await uncheck(page, "onValidityChange");
    await expect(codeSnippet(page)).not.toContainText("onValidityChange");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 18. onChangeSelect callback toggle
// ═════════════════════════════════════════════════════════════════════════════

test.describe("18. onChangeSelect toggle", () => {
  test("code snippet omits onChangeSelect when off (default)", async ({ page }) => {
    await expect(codeSnippet(page)).not.toContainText("onChangeSelect");
  });

  test("code snippet includes onChangeSelect when on", async ({ page }) => {
    await check(page, "onChangeSelect");
    await expect(codeSnippet(page)).toContainText("onChangeSelect");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 19. Output value display
// ═════════════════════════════════════════════════════════════════════════════

test.describe("19. Output value display", () => {
  test("output value shows dash when input is empty", async ({ page }) => {
    await expect(outputValue(page)).toContainText("—");
  });

  test("output value updates as user types", async ({ page }) => {
    await previewInput(page).click();
    await previewInput(page).type("9876543210");
    await expect(outputValue(page)).toContainText("+91");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 20. Country selector interactions
// ═════════════════════════════════════════════════════════════════════════════

test.describe("20. Country selector interactions", () => {
  test("custom select opens on trigger click", async ({ page }) => {
    await customSelectTrigger(page).click();
    await expect(listbox(page)).toBeVisible();
  });

  test("Escape closes the dropdown", async ({ page }) => {
    await customSelectTrigger(page).click();
    await page.keyboard.press("Escape");
    await expect(listbox(page)).not.toBeVisible();
  });

  test("search filters country list", async ({ page }) => {
    await customSelectTrigger(page).click();
    const search = page.locator('[data-testid="preview-card"] [aria-label="Search countries"]');
    await search.fill("Canada");
    const options = listbox(page).locator('[role="option"]');
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText("Canada");
  });

  test("selecting a country updates the dial code in the value", async ({ page }) => {
    await customSelectTrigger(page).click();
    const search = page.locator('[data-testid="preview-card"] [aria-label="Search countries"]');
    await search.fill("United States");
    await listbox(page).locator('[role="option"]').first().click();
    await previewInput(page).type("2025551234");
    await expect(outputValue(page)).toContainText("+1");
  });

  test("ArrowDown + Enter selects a country and closes dropdown", async ({ page }) => {
    await customSelectTrigger(page).click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(listbox(page)).not.toBeVisible();
  });

  test("trigger ARIA attributes update on open/close", async ({ page }) => {
    const trigger = customSelectTrigger(page);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 21. Copy button
// ═════════════════════════════════════════════════════════════════════════════

test.describe("21. Copy button", () => {
  test("copy button is visible", async ({ page }) => {
    await expect(page.locator('[data-testid="copy-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="copy-btn"]')).toContainText("Copy");
  });

  test("copy button label changes to Copied after click", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator('[data-testid="copy-btn"]').click();
    await expect(page.locator('[data-testid="copy-btn"]')).toContainText("Copied");
  });
});
