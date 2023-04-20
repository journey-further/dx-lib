/**
 * Take the provided element and return true or false indicating whether or not it is view of the user. If the second
 * parameter is set to false the function will return false when the element is only partially visible in the dom.
 *
 * @param element The element we wish to check for the position of
 * @param partial Whether or not to return true for a partial match, defaults to true
 * @returns Whether or not the element is in view of the user
 */
export const elementInView = (element: HTMLElement, partial = true): boolean => {
  // Error stuff
  if (!element) throw new Error("Parameter one is required");
  if (!(element instanceof HTMLElement)) throw new Error("Parameter one must be an instance of HTMLElement");
  if (typeof partial !== "boolean") throw new Error("Parameter 2 must be a boolean");
  console.log(window.innerHeight);
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
