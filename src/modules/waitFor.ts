/**
 * Either wait for the provided callback to return a truthy value (and then return it) or for max tries to be met, in
 * which case just bail and return false.
 *
 * @param callback The callback to execute
 * @param _maxTries The maximum number of times to check the callback
 * @param _timeout The timeout between each check of callback
 * @returns The truthy/falsy value
 */
export const waitFor = async (callback: () => unknown, _maxTries = 20, _timeout = 100): Promise<unknown> => {
  // init our variables
  let tries = 0;
  const timeout = _timeout;
  // Start our loop
  while (tries < _maxTries) {
    // Try get the output
    const output = callback();
    // Check it is not falsey
    if (!output) {
      // It is so increment variables
      tries += 1;
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
 * NOTE: @samrenfrew
 *
 * - Removed the increase timeout value, such that whatever is passed within the _timeout value is ALWAYS the time between
 *   checks
 * - This allows for the function to have a linear scaling similar to an interval, in which it is checked every Xms, for Y
 *   tries
 * - Defaults here are 20 tries @ 100ms, giving a total timeout of 2s (previously this would have been 21s)
 * - For anything not ready within 2s, we should really be using elementReady or a mutation observer to monitor it, as
 *   this function should really only be used to make sure a function doesn't encounter a DOM race condition
 */
