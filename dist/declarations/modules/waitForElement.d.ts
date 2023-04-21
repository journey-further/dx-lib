/**
 * Wait for an element that matches the passed CSS selector and return it, or for max tries to be met, in which case
 * just bail and return false.
 *
 * @param selector The CSS selector to find
 * @param _maxTries The maximum number of attempts
 * @param _timeout The initial timeout
 * @returns The Element if found
 */
export declare const waitForElement: (selector: string, _maxTries?: number, _timeout?: number) => Promise<Element | null>;
//# sourceMappingURL=waitForElement.d.ts.map