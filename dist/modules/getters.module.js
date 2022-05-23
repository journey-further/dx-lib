var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
export const waitFor = (callback, _maxTries = 20, _timeout = 100) => __awaiter(void 0, void 0, void 0, function* () {
    // init our variables
    let tries = 0, timeout = _timeout;
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
export const queryAll = (selector) => Array.from(document.querySelectorAll(selector));
