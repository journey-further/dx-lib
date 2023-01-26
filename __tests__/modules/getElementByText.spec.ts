import { getElementByText } from "modules";

const NO_TAG_ERR = "Provide a HTML element tag to search for as arg 1";
const NO_QUERY_ERR = "Provide a query string or regex pattern as arg 2";
const TEXT_TO_MATCH = "match this";
const TEXT_TO_NOT_MATCH = "dont match this";
const REGEX_TO_MATCH = new RegExp(TEXT_TO_MATCH);
const REGEX_TO_NOT_MATCH = new RegExp(TEXT_TO_NOT_MATCH);
const MATCHING_PARENT_SELECTOR = ".parent";
const NON_MATCHING_PARENT_SELECTOR = ".whoops";
const ELEMENT_TAG = "p";
const PARENT_TAG = "p";

describe("getElementByText", () => {
  beforeEach(() => {
    while (document.body.firstElementChild) {
      document.body.firstElementChild.remove();
    }
  });

  const setupDom = (shouldMatch: boolean, shouldMatchParent: boolean) => {
    if (!shouldMatchParent) {
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<${PARENT_TAG} class="${NON_MATCHING_PARENT_SELECTOR.replace(".", "")}"><${ELEMENT_TAG}>${
          shouldMatch ? TEXT_TO_MATCH : TEXT_TO_NOT_MATCH
        }</${ELEMENT_TAG}></${PARENT_TAG}>`
      );
    } else {
      document.body.insertAdjacentHTML(
        "afterbegin",
        `<${PARENT_TAG} class="${MATCHING_PARENT_SELECTOR.replace(".", "")}"><${ELEMENT_TAG}>${
          shouldMatch ? TEXT_TO_MATCH : TEXT_TO_NOT_MATCH
        }</${ELEMENT_TAG}></${PARENT_TAG}>`
      );
    }
  };

  it("will throw the correct error when one of the required params is omitted", () => {
    expect(() => getElementByText(undefined, "hey")).toThrow(NO_TAG_ERR);
    expect(() => getElementByText("a", undefined)).toThrow(NO_QUERY_ERR);
  });

  it("will return null if no matching element is found", () => {
    setupDom(false, false);
    const element = getElementByText(ELEMENT_TAG, TEXT_TO_MATCH);
    expect(element).toBe(null);
  });

  it("will return the matching element if a correct text query is provided with an incorrect parent query", () => {
    setupDom(true, false);
    const element = getElementByText(ELEMENT_TAG, TEXT_TO_MATCH, MATCHING_PARENT_SELECTOR);
    expect(element).toBeDefined();
    expect(element.tagName).toBe(ELEMENT_TAG.toUpperCase());
    expect(element.textContent).toBe(TEXT_TO_MATCH);
  });

  it("will return the matching parent element if a correct text query is provided with a correct parent query", () => {
    setupDom(true, true);
    const element = getElementByText(ELEMENT_TAG, TEXT_TO_MATCH, MATCHING_PARENT_SELECTOR);
    expect(element).toBeDefined();
    expect(element.tagName).toBe(PARENT_TAG.toUpperCase());
    expect(element.textContent.includes(TEXT_TO_MATCH)).toBe(true);
  });

  it("will return correct element if the query is correct and no parent query is provided", () => {
    setupDom(true, true);
    const element = getElementByText(ELEMENT_TAG, TEXT_TO_MATCH);
    expect(element).toBeDefined();
    expect(element.tagName).toBe(ELEMENT_TAG.toUpperCase());
    expect(element.textContent).toBe(TEXT_TO_MATCH);
  });
});
