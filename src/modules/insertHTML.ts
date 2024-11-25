/**
 * Inserts HTML code into a target element using `insertAdjacentHTML`, preventing duplicate elements unless specified to
 * replace.
 *
 * This function checks if an element matching the given CSS selector already exists:
 *
 * - If no target element matches `targetSelector`, it does nothing and returns `false`.
 * - If an element with `selector` exists and `replace` is `false`, it does nothing and returns `false`.
 * - If an element with `selector` exists and `replace` is `true`, it removes the existing element and inserts the new
 *   HTML.
 * - If no element with `selector` exists, it inserts the HTML into the target element at the specified position.
 *
 * @param {string} html - The HTML markup to insert.
 * @param {string} targetSelector - The CSS selector of the target element to insert into.
 * @param {string} selector - A selector to identify existing elements that match the new HTML.
 * @param {"afterbegin" | "beforebegin" | "afterend" | "beforeend"} [position="beforeend"] - The position where the HTML
 *   should be inserted. Default is `"beforeend"`
 * @param {boolean} [replace=false] - Whether to replace an existing element matching `selector`. Default is `false`
 * @returns {boolean} `true` if the HTML was inserted, otherwise `false`.
 */

export const insertHTML = (
  html: string,
  selector: string,
  targetSelector: string,
  position: "afterbegin" | "beforebegin" | "afterend" | "beforeend" = "beforeend",
  replace = false
): boolean => {
  // Get the target element
  const target = document.querySelector(targetSelector);
  // No target so we can't do anything anyway
  if (!!!target) return false;
  // First query for the element we wish to add
  const existingElement = document.querySelector(selector);
  // If it exists and we do not want to replace it just exit and return false
  if (!!existingElement && replace === false) return false;
  // Element exists but we want to replace it
  if (!!existingElement && replace === true) {
    // Remove the existing element
    existingElement.remove();
    // Insert the new one into target
    target.insertAdjacentHTML(position, html);
    // Return true so we know it was successful
    return true;
  }
  // Element doesn't exist already and target exists so just insert the HTML
  target.insertAdjacentHTML(position, html);
  // Return true so we know it was successful
  return true;
};
