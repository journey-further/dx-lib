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
 * @param element -- The element to check
 * @param dom -- The dom to check in
 * @returns Whether or not the element is in the current dom
 */
export const isInDom = (
  element /* What type is this? Should be HTMLElement */,
  dom? /* We should allow the user to use the function without passing a dom. To do this we can use a default param dom = document */
): boolean => {
  const doc = dom ?? document; // Delete this line with the default param
  return !!element && doc.documentElement.contains(element); // Remove the safety check and let it throw if the function was called without an element param
};
