/**
 * Async function to allow us to wait for the document to be in the 'complete' state
 *
 * @param maxAttempts The maximum number of times the function should check
 * @param timeout The time between each check
 * @returns Whether the doc is in the ready state
 */
export declare const docReady: (maxAttempts?: number, timeout?: number) => Promise<boolean>;
//# sourceMappingURL=docReady.d.ts.map