/**
 * Either wait for the provided callback to return a truthy value (and then return it)
 * or for max tries to be met, in which case just bail and return false.
 *
 * @param {function} callback
 * @param {number} _maxTries
 * @param {number} _timeout
 * @returns {Promise}
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
 * @param {string} selector
 * @returns {array}
 */
export const queryAll = (selector: string): HTMLElement[] => Array.from(document.querySelectorAll(selector));

/**
 * Return the element that matches the provided xPath string
 * @param path
 * @returns {HTMLElement}
 */
export const getElementByXPath = (path: string): HTMLElement =>
  (document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement) ||
  undefined;

/**
 * Recursively search for a parent element with the provided CSS Selector
 * @param element
 * @param selector
 * @returns {HTMLElement | null}
 */
export const findParents = (element: HTMLElement, selector: string): HTMLElement | null => {
  if (!!!element.parentElement) return null;
  if (!!element.parentElement.matches(selector)) return element.parentElement;
  return findParents(element.parentElement, selector);
};

/**
 * Return the element which has textContent that matches query. Query can be a string or regex.
 * Either way the function will use regex to find the element.
 * If there is no element it will return null.
 *
 * @param {string} tag
 * @param {string | regex} query
 * @param {string} parent
 * @returns {null | HTMLElement}
 */
export const getElementByText = (tag: string, query: string, parent: string): Element | null => {
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
 * @param html {string} HTML String to be parsed
 * @param selector {string} CSS selector to match the returned HTML element
 * @returns {HTMLElement | null}
 */
export const getElementFromHtmlString = (html: string, selector: string): HTMLElement | null => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, "text/html");
  return dom.querySelector(selector) || null;
};

/**
 * Return a unique string to be used as a HTML ID
 * @returns {string}
 */
export const generateId = () => {
  let id: string;
  while (!!!id || /^\d/.test(id) || !!document.querySelector(`#${id}`)) {
    id = Math.random().toString(36).substring(2, 9);
  }
  return id;
};
