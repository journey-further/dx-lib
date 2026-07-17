/**
 * Finds and returns the first element that matches the given XPath string.
 *
 * This function evaluates the provided XPath expression in the context of the document and retrieves the first matching
 * HTML element.
 *
 * @param {string} path - The XPath string used to locate the element.
 * @returns {HTMLElement | null} The matched HTML element, or `null` if no match is found.
 */

export const getElementByXPath = (path: string): HTMLElement | null =>
  (document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement) ||
  null;
