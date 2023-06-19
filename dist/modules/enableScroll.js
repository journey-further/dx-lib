import { isIphone } from "./isIphone.js";
/** Reenable the ability for the user to scroll on the device */
export const enableScroll = () => {
    var _a, _b;
    (_a = document.querySelector("#JFCRO-no-scroll")) === null || _a === void 0 ? void 0 : _a.remove();
    (_b = document.querySelector("html")) === null || _b === void 0 ? void 0 : _b.classList.remove("JFCRO_no-scroll");
    document.body.classList.remove("JFCRO_no-scroll");
    // If the useragent is a mobile then remove our style properties
    if (isIphone()) {
        const top = document.body.style.top.includes("-")
            ? parseInt(document.body.style.top.split("-")[1].split("px")[0], 10)
            : parseInt(document.body.style.top.split("px")[0], 10);
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("top");
        document.body.style.removeProperty("width");
        window.scrollTo(0, top);
    }
};
