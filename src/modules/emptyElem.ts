/**
 * Remove all child nodes of the element provided in the arguments.
 *
 * This will also remove text and comment nodes.
 *
 * @param elem The HTML element to remove children from
 */
export const emptyElem = (elem: HTMLElement): void => {
  if (!!!elem) throw new Error("Function requires an argument");
  if (!(elem instanceof HTMLElement)) throw new Error("Argument 1 must be a HTMLElement");
  while (elem.firstChild) {
    elem.firstChild.remove();
  }
  elem.textContent = "";
};
