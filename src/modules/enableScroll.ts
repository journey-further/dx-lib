import { isIphone } from "./isIphone";

/**
 * Re-enables user scrolling on the device by removing restrictions applied to the page - used in conjunction with
 * `preventScroll` function
 *
 * This function restores normal scrolling behaviour by:
 *
 * - Removing elements and classes that disable scrolling.
 * - Resetting styles applied to the `<html>` and `<body>` elements.
 * - For iPhone devices, restoring the previous scroll position and removing specific style properties.
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
