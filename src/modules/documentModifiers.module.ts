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

export const insertStyle = (style: string, ticket: string): void => {
  if (!!!document.querySelector("#" + ticket)) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<style id="` + ticket + `">${style.toString()}</style>`
    );
  }
};
