/**
 * Return the element which has textContent that matches query. Query can be a string or regex. Either way the function
 * will use regex to find the element. If there is no element it will return null.
 *
 * @param tag The element tag (for example 'div')
 * @param query The text or regex to match
 * @param parentSelector The CSS selector for the desired parent element. If this is omitted and an element matching the
 *   query is found the matching element will be returned. Otherwise the parent will be.
 * @returns The element or null
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
