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

export const replaceHTML = (elem: HTMLElement, html: string): void => {
  if (!!!elem) throw new Error("You did not provide an element");
  if (!(elem instanceof HTMLElement))
    throw Error("Parameter 1 must be a HTML element");
  if (!!!html) throw new Error("You did not provide any HTML markup");
  if (typeof html !== "string") throw Error("Parameter 2 must be a string");
  emptyElem(elem);
  elem.insertAdjacentHTML("afterbegin", html);
};

/**
 * Function to insert HTML code into a target element using insertAdjacentHTML which
 * prevents addition of duplicate elements.
 *
 * If there is no element with targetSelector return false
 *
 * If there is already an element with selector and replace is false return false
 *
 * If there is already an element with selector and replace it true, remove existing and
 * insert our HTML into target at position.
 *
 * IF there is no element with selector and target is defined insert the HTML to target
 * at position
 *
 * @param {string} html -- The HTML markup you wish to insert
 * @param {string} selector -- The selector which will identify duplicates of HTML
 * @param {string} targetSelector -- CSS selector of the element you wish insert into
 * @param {string} position -- Position for insertAdjacentHTML
 * @param {boolean} replace -- Boolean whether or not to replace an existing element with selector
 * @returns {boolean} -- Whether or not the HTML was inserted
 */
export const insertHTML = (
  html: string,
  selector: string,
  targetSelector: string,
  position:
    | "afterbegin"
    | "beforebegin"
    | "afterend"
    | "beforeend" = "afterbegin",
  replace: boolean = false
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
