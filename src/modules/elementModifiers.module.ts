/**
 *  Remove all child nodes of the element provided in the arguments.
 *
 *  This will also remove text and comment nodes.
 *
 * @param {HTMLElement} elem The HTML element to remove children from
 */
export const emptyElem = (elem: HTMLElement): void => {
  try {
    if (elem) {
      while (elem.firstChild) {
        elem.firstChild.remove();
      }
    }
  } catch (e) {
    console.log(e);
  }
};
