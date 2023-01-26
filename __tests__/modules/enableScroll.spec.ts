import { enableScroll, preventScroll } from "../../src";

const STYLE_ELEMENT_ID = "#JFCRO-no-scroll";
const ADDED_CLASS = "JFCRO_no-scroll";
const MOCK_SCROLL_Y = 123;
const IPHONE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1";
describe("enableScroll", () => {
  beforeEach(() => {
    preventScroll();
    jest.resetAllMocks();
  });

  it("will remove a style element from the document", () => {
    // mock the scrollTo function so it doesn't cause errors
    jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    enableScroll();
    expect(!!document.querySelector(STYLE_ELEMENT_ID)).toBe(false);
  });

  it("will remove classes from the body and html elements", () => {
    enableScroll();
    expect(document.querySelectorAll(`.${ADDED_CLASS}`)).toHaveLength(0);
  });

  it("will remove style from the body element", () => {
    enableScroll();
    expect(document.body.style).toHaveLength(0);
  });

  it("will call scrollTo with the value for top in the body's inline style on iphone", () => {
    // Set UA to iPhone
    Object.defineProperty(global.navigator, "userAgent", {
      value: IPHONE_USER_AGENT,
      configurable: true,
    });
    // Set top value on body -- enable scroll should remove this
    document.body.style.setProperty("top", `${MOCK_SCROLL_Y}px`);
    // Spy scroll to
    const spy = jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    enableScroll();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(0, MOCK_SCROLL_Y);
  });
});
