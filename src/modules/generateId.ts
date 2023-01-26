/**
 * Return a unique string to be used as a HTML ID
 *
 * @returns A unique ID
 */
export const generateId = (): string => {
  let id: string;
  while (!!!id || /^\d/.test(id) || !!document.querySelector(`#${id}`)) {
    id = Math.random().toString(36).substring(2, 9);
  }
  return id;
};
