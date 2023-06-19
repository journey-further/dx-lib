/**
 * Check whether the provided element is contained within the current DOM. If a second param is passed it will be used
 * as the DOM.
 *
 * @param element -- The element to check
 * @param dom -- The dom to check in
 * @returns Whether or not the element is in the current dom
 */
export const isInDom = (element, dom) => { var _a, _b; return !!(!!element && ((_b = (_a = (!!dom ? dom : document)) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.contains(element))); };
