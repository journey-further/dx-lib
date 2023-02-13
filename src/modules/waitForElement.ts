/**
 * Wait for an element that matches the passed CSS selector and return it, or for max tries to be met, in
 * which case just bail and return false.
 *
 * @param selector The CSS selector to find
 * @param _maxTries The maximum number of attempts
 * @param _timeout The initial timeout
 * @returns The Element if found
 */
export const waitForElement = async (selector: string, _maxTries = 20, _timeout = 100): Promise<Element | null> => {
  // init our variables
  let tries = 0;
  let timeout = _timeout;
  // Start our loop
  while (tries < _maxTries) {
    // Try get the output
    const output = document.querySelector(selector)
    // Check it is not falsey
    if (!!!output) {
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
