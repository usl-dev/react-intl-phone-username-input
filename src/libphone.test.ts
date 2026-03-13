import { describe, expect, it } from "vitest";
import { examples, parsePhoneNumber } from "./libphone";

describe("libphone exports", () => {
  it("re-exports parsePhoneNumber as a function", () => {
    expect(typeof parsePhoneNumber).toBe("function");
  });

  it("re-exports example metadata as an object", () => {
    expect(examples).toBeTypeOf("object");
    expect(examples).toHaveProperty("US");
  });
});
