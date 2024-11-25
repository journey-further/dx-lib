/**
 * Extracts an HTML element from a provided HTML string by matching a CSS selector.
 *
 * This function parses the given HTML string into a DOM structure and searches for the first element that matches the
 * specified CSS selector.
 *
 * @param {string} html - The HTML string to be parsed.
 * @param {string} selector - The CSS selector to match the desired element.
 * @returns {HTMLElement | null} The matched HTML element, or `null` if no match is found.
 */

export const getElementFromHtmlString = (html: string, selector: string): HTMLElement | null => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, "text/html");
  return dom.querySelector(selector) || null;
};
