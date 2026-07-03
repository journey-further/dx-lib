import { isObject } from "../../src/helpers/typeGuards";

("use strict");

describe("isObject", () => {
  it("will return false for null", () => {
    expect(isObject(null)).toBe(false);
  });

  it("will return true for a plain object", () => {
    expect(isObject({ foo: "bar" })).toBe(true);
  });

  it("will return true for an array", () => {
    expect(isObject([])).toBe(true);
  });
});
