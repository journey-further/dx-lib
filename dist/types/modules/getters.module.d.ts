/**
 * Either wait for the provided callback to return a truthy value (and then return it)
 * or for max tries to be met, in which case just bail and return false.
 *
 * @param {function} callback
 * @param {number} _maxTries
 * @param {number} _timeout
 * @returns {Promise}
 */
export declare const waitFor: (callback: () => unknown, _maxTries?: number, _timeout?: number) => Promise<unknown>;
/**
 * Return a true array of HTML elements
 *
 * @param {string} selector
 * @returns {array}
 */
export declare const queryAll: (selector: string) => HTMLElement[];
//# sourceMappingURL=getters.module.d.ts.map