import { waitFor } from "./waitFor";

/**
 * Wait for an element that matches the passed CSS selector and return it, or for max tries to be met, in which case
 * just bail and return false.
 *
 * @param selector The CSS selector to find
 * @param _maxTries The maximum number of attempts
 * @param _timeout The initial timeout
 * @returns The Element if found
 */
export const waitForElement = async (selector: string, _maxTries = 20, _timeout = 100): Promise<Element | null> => {
  const el = (await waitFor(() => document.querySelector(selector), _maxTries, _timeout)) as Promise<Element | null>;
  return el;
};

/**
 * NOTE: @samrenfrew
 *
 * - This is a duplication of the `waitFor` function, with the inherent difference that it doesn't require a user to use a
 *   callback, as the callback is set by default in this function to find an element in the page
 * - Therefore we're better off just using this as a wrapper for `waitFor` and calling that very specific function
 */
