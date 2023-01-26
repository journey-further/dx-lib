/**
 * Check whether the provided element is contained within the current DOM. If a second param is passed it will be used
 * as the DOM.
 *
 * @param element -- The element to check
 * @param dom -- The dom to check in
 * @returns Whether or not the element is in the current dom
 */
export const isInDom = (element: Element, dom?: Document): boolean =>
  !!(!!element && (!!dom ? dom : document)?.documentElement?.contains(element));
