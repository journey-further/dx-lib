import { isTouchDevice } from "modules/index";
let windowSpy;

beforeEach(() => {
  windowSpy = jest.spyOn(window, "window", "get");
});

afterEach(() => {
  windowSpy.mockRestore();
});

describe("isTouchDevice", () => {
  it("will return false for devices that don't have touch capabilities", () => {
    // maxTouchPoints
    Object.defineProperty(global.navigator, "maxTouchPoints", {
      value: 0,
      configurable: true,
    });
    expect(isTouchDevice()).toBe(false);
  });
  it("will return true for devices that have touch capabilities", () => {
    // maxTouchPoints
    Object.defineProperty(global.navigator, "maxTouchPoints", {
      value: 1,
      configurable: true,
    });
    // Define ontouchstart
    windowSpy.mockImplementation(() => ({
      ontouchstart: null,
    }));
    expect(window.ontouchstart).toBeDefined();
    expect(isTouchDevice()).toBe(true);
  });
});
