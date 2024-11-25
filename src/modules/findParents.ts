/**
 * Searches up the DOM tree to find the nearest parent element that matches a given CSS selector.
 *
 * Starting from the given element, this function checks each parent element until it finds one that matches the CSS
 * selector or reaches the top of the DOM tree. If no match is found, it returns `null`.
 *
 * @param {HTMLElement} element - The element to start searching from.
 * @param {string} selector - The CSS selector to look for in the parent elements.
 * @returns {HTMLElement | null} The first parent element that matches the selector, or `null` if none is found.
 */
export const findParents = (element: HTMLElement, selector: string): HTMLElement | null => {
  if (!!!element.parentElement) return null;
  if (!!element.parentElement.matches(selector)) return element.parentElement;
  return findParents(element.parentElement, selector);
};
