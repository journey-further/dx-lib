/**
 * Validates an array of CSS selectors or a single selector
 *
 * @param {string | string[]} selectors - The selector(s) to validate
 * @returns {boolean} True if all selectors are valid
 */
export const validateSelectors = (selectors: string | string[]): boolean => {
  const toValidate = Array.isArray(selectors) ? selectors : [selectors];
  return toValidate.every(isSelectorValid.bind(this));
};

/**
 * Validates if a CSS selector string is syntactically valid Tests the selector by attempting to use it in a
 * querySelector call
 *
 * @param {string} selector - The CSS selector to validate
 * @returns {boolean} True if the selector can be used in querySelector
 */
const isSelectorValid = (selector: string): boolean => {
  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    return false;
  }
};
