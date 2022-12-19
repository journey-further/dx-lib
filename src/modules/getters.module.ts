/**
 * Either wait for the provided callback to return a truthy value (and then return it) or for max tries to be met, in
 * which case just bail and return false.
 *
 * @param callback The callback to execute
 * @param _maxTries The maximum number of attempts
 * @param _timeout The initial timeout
 * @returns The truthy/falsy value
 */
export const waitFor = async (callback: () => unknown, _maxTries = 20, _timeout = 100): Promise<unknown> => {
  // init our variables
  let tries = 0;
  let timeout = _timeout;
  // Start our loop
  while (tries < _maxTries) {
    // Try get the output
    const output = callback();
    // Check it is not falsey
    if (!output) {
      // It is so increment variables
      tries += 1;
      timeout += _timeout;
      // And wait for timeout
      // eslint-disable-next-line
      await new Promise((resolve) => setTimeout(resolve, timeout));
    } else {
      // Otherwise return the output
      return output;
    }
  }
  return null;
};

/**
 * Return a true array of HTML elements
 *
 * @param selector The CSS Selector
 * @returns An array of HTMLElements
 */
export const queryAll = (selector: string): HTMLElement[] => Array.from(document.querySelectorAll(selector));

/**
 * Return the element that matches the provided xPath string
 *
 * @param path The xPAth string to match
 * @returns The matched HTML element
 */
export const getElementByXPath = (path: string): HTMLElement =>
  (document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement) ||
  undefined;

/**
 * Recursively search for a parent element with the provided CSS Selector
 *
 * @param element The element to find the parent of
 * @param selector The CSS selector to identify the parent
 * @returns The desired HTML element or null
 */
export const findParents = (element: HTMLElement, selector: string): HTMLElement | null => {
  if (!!!element.parentElement) return null;
  if (!!element.parentElement.matches(selector)) return element.parentElement;
  return findParents(element.parentElement, selector);
};

/**
 * Return the element which has textContent that matches query. Query can be a string or regex. Either way the function
 * will use regex to find the element. If there is no element it will return null.
 *
 * @param tag The element tag (for example 'div')
 * @param query The text or regex to match
 * @param parent The CSS selector for the desired parent element
 * @returns The element or null
 */
export const getElementByText = (
  tag: string,
  query: string | ReturnType<typeof RegExp>,
  parent: string
): Element | null => {
  const elementWithText = Array.from(document.querySelectorAll(tag)).find(
    (elem) => elem?.textContent && new RegExp(query).test(elem?.textContent)
  );
  // no element so return null
  if (!!!elementWithText) return null;
  // If there was a selector provided for parent
  if (!!parent) {
    const parentElement = elementWithText.closest(parent);
    // Conditionally return the parent
    return !!parentElement ? parentElement : null;
  }
  // Otherwise return null
  return elementWithText;
};

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

/**
 * Return a unique string to be used as a HTML ID
 *
 * @returns A unique ID
 */
export const generateId = (): string => {
  let id: string;
  while (!!!id || /^\d/.test(id) || !!document.querySelector(`#${id}`)) {
    id = Math.random().toString(36).substring(2, 9);
  }
  return id;
};
