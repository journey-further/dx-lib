import { isScreenInBounds } from "../../src";

("use strict");

const setWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
};

describe("isScreenInBounds", () => {
  it("returns true with no bounds", () => {
    setWidth(500);
    expect(isScreenInBounds()).toBe(true);
    expect(isScreenInBounds({})).toBe(true);
  });

  it("is inclusive on both ends", () => {
    setWidth(768);
    expect(isScreenInBounds({ maxWidth: 768 })).toBe(true);
    expect(isScreenInBounds({ minWidth: 768 })).toBe(true);
  });

  it("returns false outside the bounds", () => {
    setWidth(800);
    expect(isScreenInBounds({ maxWidth: 767 })).toBe(false);
    expect(isScreenInBounds({ minWidth: 801 })).toBe(false);
  });

  it("checks both bounds together", () => {
    setWidth(900);
    expect(isScreenInBounds({ minWidth: 768, maxWidth: 1024 })).toBe(true);
    setWidth(700);
    expect(isScreenInBounds({ minWidth: 768, maxWidth: 1024 })).toBe(false);
  });
});
