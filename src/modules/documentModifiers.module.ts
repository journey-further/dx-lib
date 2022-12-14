import { JfObserveFunction, JfObserver, JfObserverObject } from "types/generic";
import { isIphone } from "./deviceIdentifiers.module";

/**
 * Disable the ability for the user to scroll their device
 *
 * @returns {void}
 */
export const preventScroll = (): void => {
  // add style element to prevent scroll if there isn't one already
  if (!!!document.querySelector("#JFCRO-no-scroll")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<style id="JFCRO-no-scroll">.JFCRO-no-scroll{overflow: hidden !important;}</style>`
    );
  }
  // If is mobile use some JS trickery to prevent scroll on the main DOM
  if (isIphone()) {
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  }
  document.body.classList.add("JFCRO_no-scroll");
  document.querySelector("html")?.classList.add("JFCRO_no-scroll");
};

/**
 * Reenable the ability for the user to scroll on the device
 *
 * @returns {void}
 */
export const enableScroll = (): void => {
  document.querySelector("#JFCRO-no-scroll")?.remove();
  document.querySelector("html")?.classList.remove("JFCRO_no-scroll");
  document.body.classList.remove("JFCRO_no-scroll");
  // If the useragent is a mobile then remove our style properties
  if (isIphone()) {
    const top: number = document.body.style.top.includes("-")
      ? parseInt(document.body.style.top.split("-")[1].split("px")[0], 10)
      : parseInt(document.body.style.top.split("px")[0], 10);
    document.body.style.removeProperty("position");
    document.body.style.removeProperty("top");
    document.body.style.removeProperty("width");
    window.scrollTo(0, top);
  }
};

/**
 * Add the passed style string to either the options.elem element or the document body.
 *
 * If no options.position value is provided we will default to "beforeend".
 *
 * If no options.elem is provided we will default to document.body
 *
 * @param {string} style -- A CSS string
 * @param {string} id Ticket ID to prevent duplicate additions
 * @param {object} options -- Config options for the insert, position
 * @param {string} options.position Insert position accepted by insertAdjacentHTML and elem is a HTML element
 * @param {HTMLElement} options.elem A HTMLElement to insert the style into
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

/**
 * Function to insert HTML code into a target element using insertAdjacentHTML which prevents addition of duplicate
 * elements.
 *
 * If there is no element with targetSelector return false
 *
 * If there is already an element with selector and replace is false return false
 *
 * If there is already an element with selector and replace it true, remove existing and insert our HTML into target at
 * position.
 *
 * IF there is no element with selector and target is defined insert the HTML to target at position
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
  position: "afterbegin" | "beforebegin" | "afterend" | "beforeend" = "afterbegin",
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

/**
 * Scoped mutation observer which will prevent itself from re-adding and will utilise a globally scoped jfObservers
 * array on the window object.
 *
 * Using this will allow the WTO tag to remove all active observers on page change to ensure we avoid any memory leaks
 * from multiple observers
 *
 * @param id The id of the ticket in which this observer will be executed
 * @returns
 */

export const useMutationObserver = (id: string): JfObserver => {
  // Get the current observer array
  window.jfObservers = window.jfObservers || [];
  // Get the current observer object
  let observerObject: JfObserverObject | undefined = window.jfObservers.find(
    (obs: JfObserverObject) => obs.ticketId === id
  ) as JfObserverObject;
  // No current object in global array
  if (!observerObject) {
    // Make one
    observerObject = {
      observer: undefined,
      isObserving: false,
      ticketId: id,
    };
    // Push this instance to the global array
    window.jfObservers.push(observerObject);
  }

  const wrappedObserve: JfObserveFunction = (target, config, callback) => {
    // Check if we are already observing
    if (observerObject.isObserving) {
      console.warn("ALREADY OBSERVING");
      return false;
    }
    // Observe if not
    console.warn("OBSERVING");
    observerObject.observer = new MutationObserver(callback);
    observerObject.observer.observe(target, config);
    observerObject.isObserving = true;
    return true;
  };

  const wrappedDisconnect = () => {
    console.warn("DISCONNECTING");
    observerObject.observer?.disconnect();
    observerObject.observer = undefined;
    observerObject.isObserving = false;
    // Remove this instance from the global array
    window.jfObservers = window.jfObservers.filter((obs: JfObserverObject) => obs.ticketId !== id);
  };

  return {
    details: observerObject,
    observe: wrappedObserve,
    disconnect: wrappedDisconnect,
  };
};
