import { __awaiter } from '../_virtual/_tslib.js';

/**
 * Either wait for the provided callback to return a truthy value (and then return it)
 * or for max tries to be met, in which case just bail and return false.
 *
 * @param {function} callback
 * @param {number} _maxTries
 * @param {number} _timeout
 * @returns {Promise}
 */
const waitFor = (callback, _maxTries = 20, _timeout = 100) => __awaiter(void 0, void 0, void 0, function* () {
    // init our variables
    let tries = 0;
    let timeout = _timeout;
    // Start our loop
    while (tries < _maxTries) {
        // Try get the output
        const output = callback();
        // Check it is not falsey
        if (!output) {
            // It is so increment variables
            tries += 1;
            timeout += _timeout;
            // And wait for timeout
            yield new Promise((resolve) => setTimeout(resolve, timeout));
        }
        else {
            // Otherwise return the output
            return output;
        }
    }
    return null;
});
/**
 * Return a true array of HTML elements
 *
 * @param {string} selector
 * @returns {array}
 */
const queryAll = (selector) => Array.from(document.querySelectorAll(selector));
const getElementByXPath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
    undefined;
const findParents = (element, selector, attribute) => {
    if (!!!element.parentElement)
        return null;
    if (attribute &&
        element.parentElement.hasAttribute(selector) &&
        element.parentElement.getAttribute(selector) === attribute)
        return element.parentElement;
    if (element.parentElement.classList.contains(selector))
        return element.parentElement;
    return findParents(element.parentElement, selector);
};
/**
 * Return the element which has textContent that matches query. Query can be a string or regex.
 * Either way the function will use regex to find the element.
 * If there is no element it will return null.
 *
 * @param {string} tag
 * @param {string | regex} query
 * @param {string} parent
 * @returns {null | HTMLElement}
 */
const getElementByText = (tag, query, parent) => {
    const elementWithText = Array.from(document.querySelectorAll(tag)).find((elem) => (elem === null || elem === void 0 ? void 0 : elem.textContent) && new RegExp(query).test(elem === null || elem === void 0 ? void 0 : elem.textContent));
    // no element so return null
    if (!!!elementWithText)
        return null;
    // If there was a selector provided for parent
    if (!!parent) {
        const parentElement = elementWithText.closest(parent);
        // Conditionally return the parent
        return !!parentElement ? parentElement : null;
    }
    // Otherwise return null
    return elementWithText;
};

export { findParents, getElementByText, getElementByXPath, queryAll, waitFor };
