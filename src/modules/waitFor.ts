/**
 * Waits for a provided callback to return a truthy value or until a maximum number of attempts is reached.
 *
 * This function executes the callback repeatedly at specified intervals (default: 100ms), returning the first truthy
 * value it gets. If the maximum number of attempts is reached (default: 20) without a truthy value, it returns `null`.
 *
 * Note: This function is intended to handle short waits to avoid DOM race conditions. For longer or more complex
 * scenarios, consider using mutation observers or a dedicated monitoring solution like `elementReady`.
 *
 * @param {() => unknown} callback - The function to execute on each attempt.
 * @param {number} [maxTries=20] - The maximum number of attempts to execute the callback. Default is `20`
 * @param {number} [timeout=100] - The time in milliseconds to wait between attempts. Default is `100`
 * @returns {Promise<unknown>} Resolves with the truthy value returned by the callback or `null` if attempts are
 *   exhausted.
 */

export const waitFor = async (callback: () => unknown, maxTries = 20, timeout = 100): Promise<unknown> => {
  // init our variables
  let tries = 0;
  const time = timeout;
  // Start our loop
  while (tries < maxTries) {
    // Try get the output
    const output = callback();
    // Check it is not falsey
    if (!output) {
      // It is so increment variables
      tries += 1;
      // And wait for timeout

      await new Promise((resolve) => setTimeout(resolve, time));
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
