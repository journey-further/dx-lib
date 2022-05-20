import { enableScroll, preventScroll, insertStyle } from "../../src";

const STYLE_ELEMENT_ID = "#JFCRO-no-scroll";
const ADDED_CLASS = "JFCRO_no-scroll";
const IPHONE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1";
const ADDED_INLINE_STYLE_ATTRS = ["position", "top", "width"];
const MOCK_SCROLL_Y = 123;
const MOCK_STYLE_STRING = `.test{background: red;}`;
const MOCK_STYLE_ID = "mock-style";

describe("preventScroll", () => {
  beforeEach(() => {
    // Reset dom
    document.body.classList.remove(ADDED_CLASS);
    document.querySelector("html")?.classList.remove(ADDED_CLASS);
    ADDED_INLINE_STYLE_ATTRS.forEach((attr) =>
      document.body.style.removeProperty(attr)
    );
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
    expect(
      document.querySelector("html")?.classList.contains(ADDED_CLASS)
    ).toBe(false);
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
      expect(
        document.body.style.getPropertyValue(ADDED_INLINE_STYLE_ATTRS[i])
      ).toBeDefined();
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

  it("will call scrollTo with the value for top in the body's inline style", () => {
    const spy = jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    enableScroll();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(0, MOCK_SCROLL_Y);
  });
});

describe("insertStyle", () => {
  it("will exit if there is already an element with the ID provided so to not double add", () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div id="${MOCK_STYLE_ID}">Test</div>`
    );
    insertStyle(MOCK_STYLE_STRING, MOCK_STYLE_ID);
    const element = document.querySelector(`#${MOCK_STYLE_ID}`);
    expect(element?.tagName).toBe("DIV");
    expect(element?.textContent).toBe("Test");
  });
});
