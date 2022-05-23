/**
 * Either wait for the provided callback to return a truthy value (and then return it)
 * or for max tries to be met, in which case just bail and return false.
 *
 * @param {function} callback
 * @param {number} _maxTries
 * @param {number} _timeout
 * @returns {Promise}
 */
export const waitFor = async (
  callback: () => unknown,
  _maxTries: number = 20,
  _timeout: number = 100
): Promise<unknown> => {
  // init our variables
  let tries = 0,
    timeout = _timeout;
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
export const queryAll = (selector: string): HTMLElement[] =>
  Array.from(document.querySelectorAll(selector));
