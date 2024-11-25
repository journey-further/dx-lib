/**
 * Returns an array of HTML elements matching the provided CSS selector.
 *
 * This function queries the DOM using the specified CSS selector and converts the resulting `NodeList` into a true
 * array of `HTMLElement` objects.
 *
 * @param {string} selector - The CSS selector used to find matching elements.
 * @returns {HTMLElement[]} An array of matching HTML elements.
 */

export const queryAll = (selector: string): HTMLElement[] => Array.from(document.querySelectorAll(selector));
