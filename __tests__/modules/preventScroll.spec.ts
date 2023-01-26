import { preventScroll } from "../../src";

const STYLE_ELEMENT_ID = "#JFCRO-no-scroll";
const ADDED_CLASS = "JFCRO_no-scroll";
const IPHONE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1";
const ADDED_INLINE_STYLE_ATTRS = ["position", "top", "width"];
const MOCK_SCROLL_Y = 123;

describe("preventScroll", () => {
  beforeEach(() => {
    // Reset dom
    document.body.classList.remove(ADDED_CLASS);
    document.querySelector("html")?.classList.remove(ADDED_CLASS);
    ADDED_INLINE_STYLE_ATTRS.forEach((attr) => document.body.style.removeProperty(attr));
  });

  it("will add a style element to the document", () => {
    let style = document.querySelector(STYLE_ELEMENT_ID);
    expect(!!style).toBe(false);
    preventScroll();
    style = document.querySelector(STYLE_ELEMENT_ID);
    expect(!!style).toBe(true);
    expect(style instanceof HTMLElement).toBe(true);
  });

  it("will add the correct class to the main body and html elements", () => {
    expect(document.body.classList.contains(ADDED_CLASS)).toBe(false);
    expect(document.querySelector("html")?.classList.contains(ADDED_CLASS)).toBe(false);
  });

  it("will add inline style attributes to the body if on an iPhone", () => {
    // Add user agent
    Object.defineProperty(window.navigator, "userAgent", {
      value: IPHONE_USER_AGENT,
      configurable: true,
    });
    preventScroll();
    expect(document.body.style).toHaveLength(ADDED_INLINE_STYLE_ATTRS.length);
    for (let i = 0; i < ADDED_INLINE_STYLE_ATTRS.length; i++) {
      expect(document.body.style.getPropertyValue(ADDED_INLINE_STYLE_ATTRS[i])).toBeDefined();
    }
  });

  it("will set the scroll position by making window.scrollY negatively set as the body's top rule", () => {
    // Add user agent
    Object.defineProperty(window.navigator, "userAgent", {
      value: IPHONE_USER_AGENT,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", {
      value: MOCK_SCROLL_Y,
      configurable: true,
    });

    preventScroll();
    expect(document.body.style.top).toBe(`-${MOCK_SCROLL_Y}px`);
  });
});
