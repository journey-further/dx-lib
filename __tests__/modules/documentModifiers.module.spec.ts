import { useMutationObserver, enableScroll, preventScroll, insertStyle, insertHTML } from "../../src";

const STYLE_ELEMENT_ID = "#JFCRO-no-scroll";
const ADDED_CLASS = "JFCRO_no-scroll";
const IPHONE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1";
const ADDED_INLINE_STYLE_ATTRS = ["position", "top", "width"];
const MOCK_SCROLL_Y = 123;
const MOCK_STYLE_STRING = `.test{background: red;}`;
const MOCK_STYLE_ID = "mock-style";
const MOCK_HTML_ID = "mock-html";
const MOCK_HTML_ID_2 = "mock-html-2";
const MOCK_HTML_ID_3 = "mock-html-3";
const MOCK_HTML_ID_4 = "mock-html-4";
const MOCK_HTML_ID_5 = "mock-html-5";
const MOCK_INNER_HTML = `<div id="${MOCK_HTML_ID}"><h2>Hey</h2><p>This is a test</p></div>`;
const MOCK_INNER_HTML_ALT = `<div id="${MOCK_HTML_ID}" class="ALT"><h2>Hey</h2><p>This is a test</p></div>`;
const MOCK_INNER_HTML_2 = `<div id="${MOCK_HTML_ID}"><h2>Yo</h2><p>This is a test 2</p></div>`;
const MOCK_INNER_HTML_3 = `<div id="${MOCK_HTML_ID_3}"><h2>Yo</h2><p>This is a test 2</p></div>`;
const MOCK_INNER_HTML_4 = `<div id="${MOCK_HTML_ID_4}"><h2>Yo</h2><p>This is a test 2</p></div>`;
const MOCK_INNER_HTML_5 = `<div id="${MOCK_HTML_ID_5}"><h2>Yo</h2><p>This is a test 2</p></div>`;

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
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
  });
  it("will exit if there is already an element with the ID provided so to not double add", () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${MOCK_STYLE_ID}">Test</div>`);
    insertStyle(MOCK_STYLE_STRING, MOCK_STYLE_ID);
    const element = document.querySelector(`#${MOCK_STYLE_ID}`);
    expect(element?.tagName).toBe("DIV");
    expect(element?.textContent).toBe("Test");
  });

  it("will add a style element with the correct content and id", () => {
    insertStyle(MOCK_STYLE_STRING, MOCK_STYLE_ID);
    const style = document.querySelector(`#${MOCK_STYLE_ID}`);
    expect(style).toBeDefined();
    expect(style?.innerHTML).toBe(MOCK_STYLE_STRING);
  });
});

describe("insertHTML", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
  });

  it("will do nothing if an element with the provided selector exists and the 4th arg is not truthy", () => {
    // Insert first
    document.body.insertAdjacentHTML("afterbegin", MOCK_INNER_HTML_2);
    insertHTML(MOCK_INNER_HTML, `#${MOCK_HTML_ID}`, "body");
    const elem = document.getElementById(MOCK_HTML_ID);
    expect(elem).toBeDefined();
    expect(elem?.outerHTML).not.toBe(MOCK_INNER_HTML);
    expect(elem?.outerHTML).toBe(MOCK_INNER_HTML_2);
  });

  it("will insert HTML if there is no element with the same selector", () => {
    insertHTML(MOCK_INNER_HTML, `#${MOCK_HTML_ID}`, "body");
    const elem = document.getElementById(MOCK_HTML_ID);
    expect(elem).toBeDefined();
    expect(elem?.outerHTML).toBe(MOCK_INNER_HTML);
  });

  it("will insert to the start of the element if no position is provided", () => {
    document.body.insertAdjacentHTML("beforeend", `<div>Hey</div><div>Yo</div>`);
    insertHTML(MOCK_INNER_HTML, `#${MOCK_HTML_ID}`, "body");
    const elem = document.getElementById(MOCK_HTML_ID);
    expect(elem).toBeDefined();
    expect(elem?.outerHTML).toBe(MOCK_INNER_HTML);
    expect(document.body.childElementCount).toBe(3);
    expect(document.body.firstElementChild?.id).toBe(elem?.id);
    expect(document.body.firstElementChild?.outerHTML).toBe(elem?.outerHTML);
  });

  it("will insert to the correct position if one is provided", () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${MOCK_HTML_ID_2}">Hey</div><div>Yo</div>`);

    // beforeend
    insertHTML(MOCK_INNER_HTML, `#${MOCK_HTML_ID}`, "body", "beforeend");
    const elem = document.getElementById(MOCK_HTML_ID);
    expect(elem).toBeDefined();
    expect(elem?.outerHTML).toBe(MOCK_INNER_HTML);
    expect(document.body.lastElementChild?.outerHTML).toBe(elem?.outerHTML);

    // afterend
    insertHTML(MOCK_INNER_HTML_3, `#${MOCK_HTML_ID_3}`, `#${MOCK_HTML_ID_2}`, "afterend");
    const elem2 = document.getElementById(MOCK_HTML_ID_2);
    expect(elem2?.nextElementSibling?.outerHTML).toBe(MOCK_INNER_HTML_3);

    // beforebegin
    insertHTML(MOCK_INNER_HTML_4, `#${MOCK_HTML_ID_4}`, `#${MOCK_HTML_ID_2}`, "beforebegin");
    const elem3 = document.getElementById(MOCK_HTML_ID_2);
    expect(elem3?.previousElementSibling?.outerHTML).toBe(MOCK_INNER_HTML_4);

    // afterbegin
    insertHTML(MOCK_INNER_HTML_5, `#${MOCK_HTML_ID_5}`, `#${MOCK_HTML_ID_2}`, "afterbegin");
    const elem4 = document.getElementById(MOCK_HTML_ID_2);
    expect(elem4?.firstElementChild?.outerHTML).toBe(MOCK_INNER_HTML_5);
  });

  it("will replace the element with the same selector if the last arg is true", () => {
    document.body.insertAdjacentHTML("afterbegin", MOCK_INNER_HTML);
    insertHTML(MOCK_INNER_HTML_ALT, `#${MOCK_HTML_ID}`, "body", "afterbegin", true);
    const elem = document.getElementById(MOCK_HTML_ID);
    expect(elem).toBeDefined();
    expect(elem?.outerHTML).not.toBe(MOCK_INNER_HTML);
    expect(elem?.outerHTML).toBe(MOCK_INNER_HTML_ALT);
  });
});

describe("useMutationObserver", () => {
  const OBSERVER_ID = "OBS";
  const CONFIG = {
    childList: true,
    subtree: true,
    attributes: true,
  };
  let DEFAULT_OBJECT = {
    ticketId: OBSERVER_ID,
    observer: undefined,
    isObserving: false,
  };
  const CALLBACK = jest.fn();
  afterEach(() => {
    delete window.jfObservers;
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
    DEFAULT_OBJECT = {
      ticketId: OBSERVER_ID,
      observer: undefined,
      isObserving: false,
    };
    jest.resetAllMocks();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it("will create an observer object and push it into the global observer array if there isn't one with the Id provided there already", () => {
    useMutationObserver(OBSERVER_ID);
    expect(window.jfObservers.find((obs) => obs.ticketId === OBSERVER_ID)).toEqual(DEFAULT_OBJECT);
  });

  it("will return info from the current observer object if there is one with the provided ID already in the global array", () => {
    window.jfObservers = [DEFAULT_OBJECT];
    const { details } = useMutationObserver(OBSERVER_ID);
    expect(window.jfObservers.find((obs) => obs.ticketId === OBSERVER_ID)).toEqual(DEFAULT_OBJECT);
    expect(window.jfObservers).toHaveLength(1);
    expect(details).toBe(DEFAULT_OBJECT);
  });

  it("will correctly create a mutation observer and assign it to the correct observer object when the observe function it exposes is called", () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}">Hey</div>`);
    window.jfObservers = [DEFAULT_OBJECT];
    const { observe, details } = useMutationObserver(OBSERVER_ID);
    const node = document.querySelector(`#${OBSERVER_ID}`);
    const output = observe(node, CONFIG, CALLBACK);
    expect(output).toBe(true);
    expect(DEFAULT_OBJECT.observer).toBeDefined();
    expect(CALLBACK).not.toHaveBeenCalled();
  });

  it("will correctly attach the observer to the provided node and fire the provided callback when a mutation occurs", () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}">Hey</div>`);
    window.jfObservers = [DEFAULT_OBJECT];
    const { observe, details } = useMutationObserver(OBSERVER_ID);
    const node = document.querySelector(`#${OBSERVER_ID}`);
    const output = observe(node, CONFIG, CALLBACK);
    expect(output).toBe(true);
    expect(DEFAULT_OBJECT.observer).toBeDefined();
    expect(CALLBACK).not.toHaveBeenCalled();
    node.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}-2">Hey</div>`);
    setTimeout(() => {
      expect(CALLBACK).toHaveBeenCalled();
    }, 200);
  });

  it("will log a warning to the console if you try and call the observe function while the observer is already observing", () => {
    jest.spyOn(console, "warn");
    document.body.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}">Hey</div>`);
    window.jfObservers = [DEFAULT_OBJECT];
    const { observe, details } = useMutationObserver(OBSERVER_ID);
    const node = document.querySelector(`#${OBSERVER_ID}`);
    const output = observe(node, CONFIG, CALLBACK);
    expect(output).toBe(true);
    expect(DEFAULT_OBJECT.observer).toBeDefined();
    expect(observe(node, CONFIG, CALLBACK)).toBe(false);
    expect(console.warn).toBeCalledWith("ALREADY OBSERVING");
  });

  it("will correctly disconnect and clean the observer object from the global array if you call the disconnect method", () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}">Hey</div>`);
    window.jfObservers = [DEFAULT_OBJECT];
    const { observe, disconnect } = useMutationObserver(OBSERVER_ID);
    const node = document.querySelector(`#${OBSERVER_ID}`);
    const output = observe(node, CONFIG, CALLBACK);
    expect(output).toBe(true);
    disconnect();
    expect(window.jfObservers).toHaveLength(0);
    expect(DEFAULT_OBJECT.isObserving).toBe(false);
    expect(DEFAULT_OBJECT.observer).toBe(undefined);
  });
});
