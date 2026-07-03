import { replaceHTML } from "modules";

const NO_ELEM_ERR = "elem must be provided";
const WRONG_ELEM_TYPE_ERR = "elem must be a HTMLElement";
const NO_HTML_ARG_ERR = "html must be provided";
const WRONG_ARG_TYPE_2_ERR = "html must be a string";
const HTML_ID = `new`;
const HTML_STRING = `<p id="${HTML_ID}">Hey</p>`;
const REPLACE_ID = "replace";
const HTML_TO_REPLACE = `<p id="${REPLACE_ID}">Replace Me</p>`;

describe("replaceHTML", () => {
  it("will throw the correct errors", () => {
    // @ts-ignore-next-line
    expect(() => replaceHTML()).toThrow(NO_ELEM_ERR);
    // @ts-ignore-next-line
    expect(() => replaceHTML(true)).toThrow(WRONG_ELEM_TYPE_ERR);
    // @ts-ignore-next-line
    expect(() => replaceHTML(document.createElement("div"))).toThrow(NO_HTML_ARG_ERR);
    // @ts-ignore-next-line
    expect(() => replaceHTML(document.createElement("div"), true)).toThrow(WRONG_ARG_TYPE_2_ERR);
  });

  it("will correctly replace HTML", () => {
    const element = document.createElement("div");
    element.insertAdjacentHTML("afterbegin", HTML_TO_REPLACE);
    expect(element.querySelector(`#${REPLACE_ID}`)).toBeDefined();
    expect(element.querySelector(`#${REPLACE_ID}`) instanceof HTMLElement).toBe(true);
    replaceHTML(element, HTML_STRING);
    expect(element.querySelector(`#${REPLACE_ID}`)).toBe(null);
    expect(element.querySelector(`#${HTML_ID}`)).toBeDefined();
    expect(element.querySelector(`#${HTML_ID}`).outerHTML).toBe(HTML_STRING);
  });
});
