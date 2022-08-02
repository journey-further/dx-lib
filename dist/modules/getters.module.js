import { __awaiter, __generator } from '../node_modules/tslib/tslib.es6.js';

/**
 * Either wait for the provided callback to return a truthy value (and then return it)
 * or for max tries to be met, in which case just bail and return false.
 *
 * @param {function} callback
 * @param {number} _maxTries
 * @param {number} _timeout
 * @returns {Promise}
 */
var waitFor = function (callback, _maxTries, _timeout) {
    if (_maxTries === void 0) { _maxTries = 20; }
    if (_timeout === void 0) { _timeout = 100; }
    return __awaiter(void 0, void 0, void 0, function () {
        var tries, timeout, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tries = 0;
                    timeout = _timeout;
                    _a.label = 1;
                case 1:
                    if (!(tries < _maxTries)) return [3 /*break*/, 5];
                    output = callback();
                    if (!!output) return [3 /*break*/, 3];
                    // It is so increment variables
                    tries += 1;
                    timeout += _timeout;
                    // And wait for timeout
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, timeout); })];
                case 2:
                    // And wait for timeout
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3: 
                // Otherwise return the output
                return [2 /*return*/, output];
                case 4: return [3 /*break*/, 1];
                case 5: return [2 /*return*/, null];
            }
        });
    });
};
/**
 * Return a true array of HTML elements
 *
 * @param {string} selector
 * @returns {array}
 */
var queryAll = function (selector) { return Array.from(document.querySelectorAll(selector)); };
var getElementByXPath = function (path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
        undefined;
};
var findParents = function (element, selector, attribute) {
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
var getElementByText = function (tag, query, parent) {
    var elementWithText = Array.from(document.querySelectorAll(tag)).find(function (elem) { return (elem === null || elem === void 0 ? void 0 : elem.textContent) && new RegExp(query).test(elem === null || elem === void 0 ? void 0 : elem.textContent); });
    // no element so return null
    if (!!!elementWithText)
        return null;
    // If there was a selector provided for parent
    if (!!parent) {
        var parentElement = elementWithText.closest(parent);
        // Conditionally return the parent
        return !!parentElement ? parentElement : null;
    }
    // Otherwise return null
    return elementWithText;
};

export { findParents, getElementByText, getElementByXPath, queryAll, waitFor };
