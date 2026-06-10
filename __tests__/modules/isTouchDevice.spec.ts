import { isTouchDevice } from "modules/index";

describe("isTouchDevice", () => {
  beforeEach(() => {
    // Ensure ontouchstart is not defined by default
    delete (window as any).ontouchstart;
    Object.defineProperty(global.navigator, "maxTouchPoints", {
      value: 0,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (window as any).ontouchstart;
  });

  it("will return false for devices that don't have touch capabilities", () => {
    expect(isTouchDevice()).toBe(false);
  });

  it("will return true for devices that have touch capabilities", () => {
    Object.defineProperty(global.navigator, "maxTouchPoints", {
      value: 1,
      configurable: true,
    });
    (window as any).ontouchstart = null;
    expect(isTouchDevice()).toBe(true);
  });
});
