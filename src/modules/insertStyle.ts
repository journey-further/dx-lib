/**
 * Add the passed style string to either the options.elem element or the document body.
 *
 * If no options.position value is provided we will default to "beforeend".
 *
 * If no options.elem is provided we will default to document.body
 *
 * @param style -- A CSS string
 * @param id Ticket ID to prevent duplicate additions
 * @param options -- Config options for the insert, position
 * @param options.position Insert position accepted by insertAdjacentHTML and elem is a HTML element
 * @param options.elem A HTMLElement to insert the style into
 */
export const insertStyle = (
  style: string,
  id: string,
  options?: {
    position?: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
    elem?: HTMLElement;
  }
): void => {
  // Exit an element exists with this ID
  if (!!document.querySelector(`#${id}`)) return;
  // Generate our HTML
  const styleElem = `<style id="${id}">${style.toString()}</style>`;
  // Get our insert position
  const insertPosition = options?.position ? options.position : "beforeend";
  // If an element was passed
  if (options?.elem) {
    options.elem.insertAdjacentHTML(insertPosition, styleElem);
  } else {
    // default to document.body
    document.body.insertAdjacentHTML(insertPosition, styleElem);
  }
};
