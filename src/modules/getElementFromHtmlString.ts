/**
 * Return the HTML element (within the HTML string provided) which matches the provided CSS selector.
 *
 * @param html HTML String to be parsed
 * @param selector CSS selector to match the returned HTML element
 * @returns The desired HTML element or null
 */
export const getElementFromHtmlString = (html: string, selector: string): HTMLElement | null => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, "text/html");
  return dom.querySelector(selector) || null;
};
