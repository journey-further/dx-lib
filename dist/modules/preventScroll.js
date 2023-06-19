import { isIphone } from "./isIphone.js";
/** Disable the ability for the user to scroll their device */
export const preventScroll = () => {
    var _a;
    // add style element to prevent scroll if there isn't one already
    if (!!!document.querySelector("#JFCRO-no-scroll")) {
        document.body.insertAdjacentHTML("beforeend", `<style id="JFCRO-no-scroll">.JFCRO-no-scroll{overflow: hidden !important;}</style>`);
    }
    // If is mobile use some JS trickery to prevent scroll on the main DOM
    if (isIphone()) {
        document.body.style.top = `-${window.scrollY}px`;
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
    }
    document.body.classList.add("JFCRO_no-scroll");
    (_a = document.querySelector("html")) === null || _a === void 0 ? void 0 : _a.classList.add("JFCRO_no-scroll");
};
