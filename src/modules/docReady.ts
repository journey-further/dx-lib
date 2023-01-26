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
