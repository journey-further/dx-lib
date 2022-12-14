/**
 * Async function to allow us to wait for the document to be in the 'complete' state
 *
 * @param maxAttempts The maximum number of times the function should check
 * @param timeout The time between each check
 * @returns Whether the doc is in the ready state
 */
export const docReady = async (maxAttempts = 10, timeout = 200): Promise<boolean> => {
  let attempts = 0;
  if (document.readyState === "complete") return true;
  while (!/^complete$/gi.test(document.readyState)) {
    if (attempts >= maxAttempts) return false;
    attempts += 1;
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(null);
      }, timeout)
    );
  }
  return true;
};

/**
 * Check whether the provided element is contained within the current DOM. If a second param is passed it will be used
 * as the DOM.
 *
 * @param element.element
 * @param element -- The element to check
 * @param dom -- The dom to check in
 * @param element.dom
 * @returns Whether or not the element is in the current dom
 */
export const isInDom = (element: Element, dom?: Document): boolean =>
  !!(!!element && (!!dom ? dom : document)?.documentElement?.contains(element));
