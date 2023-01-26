/**
 * Return the element that matches the provided xPath string
 *
 * @param path The xPAth string to match
 * @returns The matched HTML element
 */
export const getElementByXPath = (path: string): HTMLElement =>
  (document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement) ||
  undefined;
