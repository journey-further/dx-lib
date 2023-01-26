/**
 * Return a true array of HTML elements
 *
 * @param selector The CSS Selector
 * @returns An array of HTMLElements
 */
export const queryAll = (selector: string): HTMLElement[] => Array.from(document.querySelectorAll(selector));
