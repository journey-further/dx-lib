/**
 * Either wait for the provided callback to return a truthy value (and then return it) or for max tries to be met, in
 * which case just bail and return false.
 *
 * @param callback The callback to execute
 * @param _maxTries The maximum number of attempts
 * @param _timeout The initial timeout
 * @returns The truthy/falsy value
 */
export declare const waitFor: (callback: () => unknown, _maxTries?: number, _timeout?: number) => Promise<unknown>;
//# sourceMappingURL=waitFor.d.ts.map