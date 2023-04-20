/**
 * Return the element which has textContent that matches query. Query can be a string or regex. Either way the function
 * will use regex to find the element. If there is no element it will return null.
 *
 * @param tag The element tag (for example 'div')
 * @param query The text or regex to match
 * @param parentSelector The CSS selector for the desired parent element. If this is omitted and an element matching the
 *   query is found the matching element will be returned. Otherwise the parent will be.
 * @returns The element or null
 */
export declare const getElementByText: (tag: keyof HTMLElementTagNameMap, query: string | ReturnType<typeof RegExp>, parentSelector?: string) => Element | null;
//# sourceMappingURL=getElementByText.d.ts.map