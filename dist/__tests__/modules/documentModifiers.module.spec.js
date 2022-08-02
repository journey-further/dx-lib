import { enableScroll, preventScroll, insertStyle, insertHTML, } from "../../src";
var STYLE_ELEMENT_ID = "#JFCRO-no-scroll";
var ADDED_CLASS = "JFCRO_no-scroll";
var IPHONE_USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1";
var ADDED_INLINE_STYLE_ATTRS = ["position", "top", "width"];
var MOCK_SCROLL_Y = 123;
var MOCK_STYLE_STRING = ".test{background: red;}";
var MOCK_STYLE_ID = "mock-style";
var MOCK_HTML_ID = "mock-html";
var MOCK_HTML_ID_2 = "mock-html-2";
var MOCK_HTML_ID_3 = "mock-html-3";
var MOCK_HTML_ID_4 = "mock-html-4";
var MOCK_HTML_ID_5 = "mock-html-5";
var MOCK_INNER_HTML = "<div id=\"".concat(MOCK_HTML_ID, "\"><h2>Hey</h2><p>This is a test</p></div>");
var MOCK_INNER_HTML_ALT = "<div id=\"".concat(MOCK_HTML_ID, "\" class=\"ALT\"><h2>Hey</h2><p>This is a test</p></div>");
var MOCK_INNER_HTML_2 = "<div id=\"".concat(MOCK_HTML_ID, "\"><h2>Yo</h2><p>This is a test 2</p></div>");
var MOCK_INNER_HTML_3 = "<div id=\"".concat(MOCK_HTML_ID_3, "\"><h2>Yo</h2><p>This is a test 2</p></div>");
var MOCK_INNER_HTML_4 = "<div id=\"".concat(MOCK_HTML_ID_4, "\"><h2>Yo</h2><p>This is a test 2</p></div>");
var MOCK_INNER_HTML_5 = "<div id=\"".concat(MOCK_HTML_ID_5, "\"><h2>Yo</h2><p>This is a test 2</p></div>");
describe("preventScroll", function () {
    beforeEach(function () {
        var _a;
        // Reset dom
        document.body.classList.remove(ADDED_CLASS);
        (_a = document.querySelector("html")) === null || _a === void 0 ? void 0 : _a.classList.remove(ADDED_CLASS);
        ADDED_INLINE_STYLE_ATTRS.forEach(function (attr) {
            return document.body.style.removeProperty(attr);
        });
    });
    it("will add a style element to the document", function () {
        var style = document.querySelector(STYLE_ELEMENT_ID);
        expect(!!style).toBe(false);
        preventScroll();
        style = document.querySelector(STYLE_ELEMENT_ID);
        expect(!!style).toBe(true);
        expect(style instanceof HTMLElement).toBe(true);
    });
    it("will add the correct class to the main body and html elements", function () {
        var _a;
        expect(document.body.classList.contains(ADDED_CLASS)).toBe(false);
        expect((_a = document.querySelector("html")) === null || _a === void 0 ? void 0 : _a.classList.contains(ADDED_CLASS)).toBe(false);
    });
    it("will add inline style attributes to the body if on an iPhone", function () {
        // Add user agent
        Object.defineProperty(window.navigator, "userAgent", {
            value: IPHONE_USER_AGENT,
            configurable: true,
        });
        preventScroll();
        expect(document.body.style).toHaveLength(ADDED_INLINE_STYLE_ATTRS.length);
        for (var i = 0; i < ADDED_INLINE_STYLE_ATTRS.length; i++) {
            expect(document.body.style.getPropertyValue(ADDED_INLINE_STYLE_ATTRS[i])).toBeDefined();
        }
    });
    it("will set the scroll position by making window.scrollY negatively set as the body's top rule", function () {
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
        expect(document.body.style.top).toBe("-".concat(MOCK_SCROLL_Y, "px"));
    });
});
describe("enableScroll", function () {
    beforeEach(function () {
        preventScroll();
        jest.resetAllMocks();
    });
    it("will remove a style element from the document", function () {
        // mock the scrollTo function so it doesn't cause errors
        jest.spyOn(window, "scrollTo").mockImplementation(function () { });
        enableScroll();
        expect(!!document.querySelector(STYLE_ELEMENT_ID)).toBe(false);
    });
    it("will remove classes from the body and html elements", function () {
        enableScroll();
        expect(document.querySelectorAll(".".concat(ADDED_CLASS))).toHaveLength(0);
    });
    it("will remove style from the body element", function () {
        enableScroll();
        expect(document.body.style).toHaveLength(0);
    });
    it("will call scrollTo with the value for top in the body's inline style", function () {
        var spy = jest.spyOn(window, "scrollTo").mockImplementation(function () { });
        enableScroll();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(0, MOCK_SCROLL_Y);
    });
});
describe("insertStyle", function () {
    afterEach(function () {
        while (document.body.firstChild) {
            document.body.firstChild.remove();
        }
    });
    it("will exit if there is already an element with the ID provided so to not double add", function () {
        document.body.insertAdjacentHTML("beforeend", "<div id=\"".concat(MOCK_STYLE_ID, "\">Test</div>"));
        insertStyle(MOCK_STYLE_STRING, MOCK_STYLE_ID);
        var element = document.querySelector("#".concat(MOCK_STYLE_ID));
        expect(element === null || element === void 0 ? void 0 : element.tagName).toBe("DIV");
        expect(element === null || element === void 0 ? void 0 : element.textContent).toBe("Test");
    });
    it("will add a style element with the correct content and id", function () {
        insertStyle(MOCK_STYLE_STRING, MOCK_STYLE_ID);
        var style = document.querySelector("#".concat(MOCK_STYLE_ID));
        expect(style).toBeDefined();
        expect(style === null || style === void 0 ? void 0 : style.innerHTML).toBe(MOCK_STYLE_STRING);
    });
});
describe("insertHTML", function () {
    afterEach(function () {
        while (document.body.firstChild) {
            document.body.firstChild.remove();
        }
    });
    it("will do nothing if an element with the provided selector exists and the 4th arg is not truthy", function () {
        // Insert first
        document.body.insertAdjacentHTML("afterbegin", MOCK_INNER_HTML_2);
        insertHTML(MOCK_INNER_HTML, "#".concat(MOCK_HTML_ID), "body");
        var elem = document.getElementById(MOCK_HTML_ID);
        expect(elem).toBeDefined();
        expect(elem === null || elem === void 0 ? void 0 : elem.outerHTML).not.toBe(MOCK_INNER_HTML);
        expect(elem === null || elem === void 0 ? void 0 : elem.outerHTML).toBe(MOCK_INNER_HTML_2);
    });
    it("will insert HTML if there is no element with the same selector", function () {
        insertHTML(MOCK_INNER_HTML, "#".concat(MOCK_HTML_ID), "body");
        var elem = document.getElementById(MOCK_HTML_ID);
        expect(elem).toBeDefined();
        expect(elem === null || elem === void 0 ? void 0 : elem.outerHTML).toBe(MOCK_INNER_HTML);
    });
    it("will insert to the start of the element if no position is provided", function () {
        var _a, _b;
        document.body.insertAdjacentHTML("beforeend", "<div>Hey</div><div>Yo</div>");
        insertHTML(MOCK_INNER_HTML, "#".concat(MOCK_HTML_ID), "body");
        var elem = document.getElementById(MOCK_HTML_ID);
        expect(elem).toBeDefined();
        expect(elem === null || elem === void 0 ? void 0 : elem.outerHTML).toBe(MOCK_INNER_HTML);
        expect(document.body.childElementCount).toBe(3);
        expect((_a = document.body.firstElementChild) === null || _a === void 0 ? void 0 : _a.id).toBe(elem === null || elem === void 0 ? void 0 : elem.id);
        expect((_b = document.body.firstElementChild) === null || _b === void 0 ? void 0 : _b.outerHTML).toBe(elem === null || elem === void 0 ? void 0 : elem.outerHTML);
    });
    it("will insert to the correct position if one is provided", function () {
        var _a, _b, _c, _d;
        document.body.insertAdjacentHTML("beforeend", "<div id=\"".concat(MOCK_HTML_ID_2, "\">Hey</div><div>Yo</div>"));
        // beforeend
        insertHTML(MOCK_INNER_HTML, "#".concat(MOCK_HTML_ID), "body", "beforeend");
        var elem = document.getElementById(MOCK_HTML_ID);
        expect(elem).toBeDefined();
        expect(elem === null || elem === void 0 ? void 0 : elem.outerHTML).toBe(MOCK_INNER_HTML);
        expect((_a = document.body.lastElementChild) === null || _a === void 0 ? void 0 : _a.outerHTML).toBe(elem === null || elem === void 0 ? void 0 : elem.outerHTML);
        // afterend
        insertHTML(MOCK_INNER_HTML_3, "#".concat(MOCK_HTML_ID_3), "#".concat(MOCK_HTML_ID_2), "afterend");
        var elem2 = document.getElementById(MOCK_HTML_ID_2);
        expect((_b = elem2 === null || elem2 === void 0 ? void 0 : elem2.nextElementSibling) === null || _b === void 0 ? void 0 : _b.outerHTML).toBe(MOCK_INNER_HTML_3);
        // beforebegin
        insertHTML(MOCK_INNER_HTML_4, "#".concat(MOCK_HTML_ID_4), "#".concat(MOCK_HTML_ID_2), "beforebegin");
        var elem3 = document.getElementById(MOCK_HTML_ID_2);
        expect((_c = elem3 === null || elem3 === void 0 ? void 0 : elem3.previousElementSibling) === null || _c === void 0 ? void 0 : _c.outerHTML).toBe(MOCK_INNER_HTML_4);
        // afterbegin
        insertHTML(MOCK_INNER_HTML_5, "#".concat(MOCK_HTML_ID_5), "#".concat(MOCK_HTML_ID_2), "afterbegin");
        var elem4 = document.getElementById(MOCK_HTML_ID_2);
        expect((_d = elem4 === null || elem4 === void 0 ? void 0 : elem4.firstElementChild) === null || _d === void 0 ? void 0 : _d.outerHTML).toBe(MOCK_INNER_HTML_5);
    });
    it("will replace the element with the same selector if the last arg is true", function () {
        document.body.insertAdjacentHTML("afterbegin", MOCK_INNER_HTML);
        insertHTML(MOCK_INNER_HTML_ALT, "#".concat(MOCK_HTML_ID), "body", "afterbegin", true);
        var elem = document.getElementById(MOCK_HTML_ID);
        expect(elem).toBeDefined();
        expect(elem === null || elem === void 0 ? void 0 : elem.outerHTML).not.toBe(MOCK_INNER_HTML);
        expect(elem === null || elem === void 0 ? void 0 : elem.outerHTML).toBe(MOCK_INNER_HTML_ALT);
    });
});
