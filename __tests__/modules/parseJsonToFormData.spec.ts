import { parseJsonToFormData } from "../../src";

("use strict");

describe("parseJsonToFormData", () => {
  it("will convert a plain object into FormData", () => {
    const result = parseJsonToFormData({ foo: "bar", baz: 1 });
    expect(result instanceof FormData).toBe(true);
    expect(result.get("foo")).toBe("bar");
    expect(result.get("baz")).toBe("1");
  });

  it("will throw when passed null", () => {
    expect(() => parseJsonToFormData(null as unknown as { [key: string]: unknown })).toThrow(
      "Parameter 1 must be of type object",
    );
  });

  it("will throw when passed an array", () => {
    expect(() => parseJsonToFormData(["a", "b"] as unknown as { [key: string]: unknown })).toThrow(
      "Parameter 1 must be of type object",
    );
  });
});
