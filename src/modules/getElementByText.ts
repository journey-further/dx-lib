/**
 * Finds an element by matching its text content to a string or regular expression.
 *
 * This function searches for an element of the specified tag type whose `textContent` matches the provided query.
 * Optionally, it can return the closest parent element that matches a given CSS selector instead.
 *
 * - Providing a string will make an exact match the textContent of the element
 * - For a looser match, regex can be used including params such as g (global) and i (case-insensitive)
 *
 * @param {keyof HTMLElementTagNameMap} tag - The tag name of the HTML element to search for (e.g., 'div', 'span').
 * @param {string | RegExp} query - The text or regular expression to match against the element's `textContent`.
 * @param {string} [parentSelector] - An optional CSS selector for the desired parent element. If provided, the function
 *   will return the matching parent element if it exists, otherwise the matching element itself.
 * @returns {Element | null} The matching element, its parent (if specified), or `null` if no match is found.
 */

export const getElementByText = (
  tag: keyof HTMLElementTagNameMap,
  query: string | ReturnType<typeof RegExp>,
  parentSelector?: string
): Element | null => {
  // Get the args first
  if (!tag) throw new Error("Provide a HTML element tag to search for as arg 1");
  if (!query) throw new Error("Provide a query string or regex pattern as arg 2");

  const elementWithText = Array.from(document.querySelectorAll(tag)).find((elem) => {
    if (typeof query === "string") {
      return elem?.textContent && elem.textContent === query;
    }
    return elem?.textContent && query.test(elem.textContent);
  });

  // no element so return null
  if (!!!elementWithText) return null;

  // If there was a selector provided for parent
  if (!!parentSelector) {
    const parentElement = elementWithText.closest(parentSelector);
    // Conditionally return the parent
    return !!parentElement ? parentElement : elementWithText;
  }
  // Otherwise return the element
  return elementWithText;
};
