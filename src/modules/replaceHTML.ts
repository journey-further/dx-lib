import { jfError } from "../helpers";
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
  if (!!!elem) throw jfError("MISSING_OPTION", "elem must be provided");
  if (!(elem instanceof HTMLElement)) throw jfError("INVALID_TYPE", "elem must be a HTMLElement");
  if (!!!html) throw jfError("MISSING_OPTION", "html must be provided");
  if (typeof html !== "string") throw jfError("INVALID_TYPE", "html must be a string");
  emptyElem(elem);
  elem.insertAdjacentHTML("afterbegin", html);
};
