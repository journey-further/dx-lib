/**
 * Waits asynchronously until the document reaches the 'complete' ready state.
 *
 * This function repeatedly checks if the document's `readyState` is "complete" and resolves once it is, or stops after
 * a specified number of attempts. It can be used to ensure the document is fully loaded before executing further
 * logic.
 *
 * @param {number} [maxAttempts=10] - The maximum number of times to check the document's ready state. Default is `10`
 * @param {number} [timeout=200] - The delay in milliseconds between each check. Default is `200`
 * @returns {Promise<boolean>} A promise that resolves to `true` if the document reaches the 'complete' state, or
 *   `false` if the maximum attempts are exceeded.
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
