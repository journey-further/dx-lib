var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
 * Either wait for the provided callback to return a truthy value (and then return it)
 * or for max tries to be met, in which case just bail and return false.
 *
 * @param {function} callback
 * @param {number} _maxTries
 * @param {number} _timeout
 * @returns {Promise}
 */
export var waitFor = function (callback, _maxTries, _timeout) {
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
export var queryAll = function (selector) { return Array.from(document.querySelectorAll(selector)); };
export var getElementByXPath = function (path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
        undefined;
};
export var findParents = function (element, selector, attribute) {
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
export var getElementByText = function (tag, query, parent) {
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
