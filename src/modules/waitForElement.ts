import { waitFor } from "./waitFor";

/**
 * Waits for an element that matches the specified CSS selector to appear in the DOM and returns it.
 *
 * This function uses the `waitFor` utility to repeatedly check for the presence of an element matching the provided CSS
 * selector. If the element is found within the maximum number of attempts (default: 20), it is returned. If not, the
 * function returns `null`.
 *
 * @param {string} selector - The CSS selector of the element to wait for.
 * @param {number} [maxTries=20] - The maximum number of attempts to find the element. Default is 20. Default is `20`
 * @param {number} [timeout=100] - The time in milliseconds to wait between attempts. Default is 100ms. Default is `100`
 * @returns {Promise<Element | null>} Resolves with the element if found, or `null` if attempts are exhausted.
 */

export const waitForElement = async (selector: string, maxTries = 20, timeout = 100): Promise<Element | null> => {
  const el = (await waitFor(() => document.querySelector(selector), maxTries, timeout)) as Element | null;
  return el;
};

/**
 * NOTE: @samrenfrew
 *
 * - This is a duplication of the `waitFor` function, with the inherent difference that it doesn't require a user to use a
 *   callback, as the callback is set by default in this function to find an element in the page
 * - Therefore we're better off just using this as a wrapper for `waitFor` and calling that very specific function
 */
