/**
 * Determines whether a given HTML element is visible within the user's viewport.
 *
 * This function checks the position of an element relative to the viewport and returns `true` or `false` based on its
 * visibility. By default, it considers the element visible if it is partially in view, but this behaviour can be
 * disabled by setting `partial` parameter to `false`, forcing a check for the entire element to be visible.
 *
 * @param {HTMLElement} element - The HTML element to check for visibility.
 * @param {boolean} [partial=true] - Whether to allow for partial visibility. Default is `true`
 * @returns {boolean} `true` if the element is in view (partially or fully, based on `partial`), otherwise `false`.
 */

export const elementInView = (element: HTMLElement, partial = true): boolean => {
  // Error stuff
  if (!element) throw new Error("Parameter one is required");
  if (!(element instanceof HTMLElement)) throw new Error("Parameter one must be an instance of HTMLElement");
  if (typeof partial !== "boolean") throw new Error("Parameter 2 must be a boolean");
  const { height, top, bottom } = element.getBoundingClientRect();

  // Checking whether fully visible
  if (top >= 0 && bottom <= window.innerHeight) {
    return true;
  }

  // Partially visible, cut-off from the top
  const isBottomVisible = top < 0 && bottom > 0;
  // Partially visible, cut-off from the bottom
  const isTopVisible = top >= 0 && bottom >= window.innerHeight;
  // Partially visible, cut-off top and bottom
  const isMiddleVisible = height > window.innerHeight && top < 0 && bottom > window.innerHeight;

  // Checking for partial visibility
  if (isBottomVisible || isTopVisible || isMiddleVisible) {
    // Just return the partial param as it will be false if the user wants it to be false
    return partial;
  }

  // Not visible at all
  return false;
};
