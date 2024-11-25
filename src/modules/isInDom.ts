/**
 * Checks if the provided element is part of the DOM.
 *
 * This function determines whether the specified element exists within the current document or a provided DOM.
 * Optionally, a specific DOM can be passed for the check (e.g. when parsing another page via a fetch request).
 *
 * @param {Element} element - The element to check for presence in the DOM.
 * @param {Document} [dom=document] - The specific DOM to check within. Default is `document`
 * @returns {boolean} `true` if the element is found in the DOM, otherwise `false`.
 */

export const isInDom = (element: Element, dom?: Document): boolean =>
  !!(!!element && (!!dom ? dom : document)?.documentElement?.contains(element));
