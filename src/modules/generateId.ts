/**
 * Generates a unique string that can be used as an HTML ID.
 *
 * This function creates a random string and ensures it:
 *
 * - Does not start with a digit.
 * - Does not already exist as an ID in the current document.
 *
 * @returns {string} A unique ID.
 */

export const generateId = (): string => {
  let id: string;
  while (!!!id || /^\d/.test(id) || !!document.querySelector(`#${id}`)) {
    id = Math.random().toString(36).substring(2, 9);
  }
  return id;
};
