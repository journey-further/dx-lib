import { emptyElem } from "./emptyElem";

/**
 * Replaces the HTML content of the specified element with the provided HTML string.
 *
 * This function clears all existing content within the given element and inserts the new HTML.
 *
 * @param {HTMLElement} elem - The element whose content will be replaced.
 * @param {string} html - The HTML string to insert into the element.
 */

export const replaceHTML = (elem: HTMLElement, html: string): void => {
  if (!!!elem) throw new Error("Provide a HTML element as arg 1");
  if (!(elem instanceof HTMLElement)) throw Error("Parameter 1 must be a HTML element");
  if (!!!html) throw new Error("Provide HTML markup as arg 2");
  if (typeof html !== "string") throw Error("Parameter 2 must be a string");
  emptyElem(elem);
  elem.insertAdjacentHTML("afterbegin", html);
};
