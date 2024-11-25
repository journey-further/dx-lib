/**
 * Removes all child nodes, including text and comment nodes, from a specified HTML element.
 *
 * This function clears the content of the provided element by removing all of its children.
 *
 * @param {HTMLElement} elem - The HTML element to clear.
 */
export const emptyElem = (elem: HTMLElement): void => {
  if (!!!elem) throw new Error("Function requires an argument");
  if (!(elem instanceof HTMLElement)) throw new Error("Argument 1 must be a HTMLElement");
  while (elem.firstChild) {
    elem.firstChild.remove();
  }
  elem.textContent = "";
};
