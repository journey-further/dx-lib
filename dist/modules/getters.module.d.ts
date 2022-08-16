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
export declare const getElementByXPath: (path: string) => HTMLElement;
export declare const findParents: (element: HTMLElement, selector: string, attribute?: string) => HTMLElement | null;
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
export declare const getElementByText: (tag: string, query: string, parent: string) => Element | null;
//# sourceMappingURL=getters.module.d.ts.map