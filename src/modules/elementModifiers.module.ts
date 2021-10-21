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
