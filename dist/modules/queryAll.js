/**
 * Return a true array of HTML elements
 *
 * @param selector The CSS Selector
 * @returns An array of HTMLElements
 */
export const queryAll = (selector) => Array.from(document.querySelectorAll(selector));
