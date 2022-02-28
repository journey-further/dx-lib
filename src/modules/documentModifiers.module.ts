import { isIphone } from "./deviceIdentifiers.module";

export const preventScroll = (): void => {
  document.body.classList.add("JFCRO_no-scroll");
  document.querySelector("html")?.classList.add("JFCRO_no-scroll");
  // If is mobile use some JS trickery to prevent scroll on the main DOM
  if (isIphone()) {
    document.body.style.position = "fixed";
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.width = "100%";
  }
};

export const enableScroll = (): void => {
  document.querySelector("html")?.classList.remove("JFCRO_no-scroll");
  document.body.classList.remove("JFCRO_no-scroll");
  // If the useragent is a mobile then remove our style properties
  if (isIphone()) {
    const top: number = document.body.style.top.includes("-")
      ? parseInt(document.body.style.top.split("-")[1].split("px")[0])
      : parseInt(document.body.style.top.split("px")[0]);
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
 * @param {string} ticket -- Ticket ID to prevent duplicate additions
 * @param {object} options -- Config options for the insert, position
 * is an insert position accepted by insertAdjacentHTML and elem is a HTML element
 */
export const insertStyle = (
  style: string,
  ticket: string,
  options?: {
    position?: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
    elem?: HTMLElement;
  }
): void => {
  // Exit an element exists with this ID
  if (!!document.querySelector("#" + ticket)) return;
  // Generate our HTML
  const styleElem: string =
    `<style id="` + ticket + `">${style.toString()}</style>`;
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
