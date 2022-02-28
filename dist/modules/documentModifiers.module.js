import { isIphone } from "./deviceIdentifiers.module";
export const preventScroll = () => {
    var _a;
    document.body.classList.add("JFCRO_no-scroll");
    (_a = document.querySelector("html")) === null || _a === void 0 ? void 0 : _a.classList.add("JFCRO_no-scroll");
    if (isIphone()) {
        document.body.style.position = "fixed";
        document.body.style.top = `-${window.scrollY}px`;
        document.body.style.width = "100%";
    }
};
export const enableScroll = () => {
    var _a;
    (_a = document.querySelector("html")) === null || _a === void 0 ? void 0 : _a.classList.remove("JFCRO_no-scroll");
    document.body.classList.remove("JFCRO_no-scroll");
    if (isIphone()) {
        const top = document.body.style.top.includes("-")
            ? parseInt(document.body.style.top.split("-")[1].split("px")[0])
            : parseInt(document.body.style.top.split("px")[0]);
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("top");
        document.body.style.removeProperty("width");
        window.scrollTo(0, top);
    }
};
export const insertStyle = (style, ticket) => {
    if (!!!document.querySelector("#" + ticket)) {
        document.body.insertAdjacentHTML("beforeend", `<style id="` + ticket + `">${style.toString()}</style>`);
    }
};
