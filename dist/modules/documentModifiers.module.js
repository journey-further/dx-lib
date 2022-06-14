import { isIphone } from "./deviceIdentifiers.module";
/**
 * Disable the ability for the user to scroll their device
 * @returns {void}
 */
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
/**
 * Reenable the ability for the user to scroll on the device
 * @returns {void}
 */
export const enableScroll = () => {
    var _a, _b;
    (_a = document.querySelector("#JFCRO-no-scroll")) === null || _a === void 0 ? void 0 : _a.remove();
    (_b = document.querySelector("html")) === null || _b === void 0 ? void 0 : _b.classList.remove("JFCRO_no-scroll");
    document.body.classList.remove("JFCRO_no-scroll");
    // If the useragent is a mobile then remove our style properties
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
export const insertStyle = (style, id, options) => {
    // Exit an element exists with this ID
    if (!!document.querySelector(`#${id}`))
        return;
    // Generate our HTML
    const styleElem = `<style id="${id}">${style.toString()}</style>`;
    // Get our insert position
    const insertPosition = (options === null || options === void 0 ? void 0 : options.position) ? options.position : "beforeend";
    // If an element was passed
    if (options === null || options === void 0 ? void 0 : options.elem) {
        options.elem.insertAdjacentHTML(insertPosition, styleElem);
    }
    else {
        // default to document.body
        document.body.insertAdjacentHTML(insertPosition, styleElem);
    }
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
export const insertHTML = (html, selector, targetSelector, position = "afterbegin", replace = false) => {
    // Get the target element
    const target = document.querySelector(targetSelector);
    // No target so we can't do anything anyway
    if (!!!target)
        return false;
    // First query for the element we wish to add
    const existingElement = document.querySelector(selector);
    // If it exists and we do not want to replace it just exit and return false
    if (!!existingElement && replace === false)
        return false;
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
