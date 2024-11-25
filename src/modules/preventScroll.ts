import { isIphone } from "./isIphone";

/**
 * Prevents the user from scrolling on their device - used in conjunction with `enableScroll` function
 *
 * This function disables scrolling by:
 *
 * - Adding a `<style>` element with CSS rules to prevent scrolling, if it doesn't already exist.
 * - Applying additional styles for iPhone devices to lock the scroll position and prevent movement.
 * - Adding a `JFCRO_no-scroll` class to the `<body>` and `<html>` elements to enforce the no-scroll behaviour.
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
