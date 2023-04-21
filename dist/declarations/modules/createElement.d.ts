export interface CreateElementParams {
    [key: string]: string;
}
/**
 * Function to create a new HTML Element according to the provided string. If no elem parameter is provided it will
 * default to a div container. If the elem parameter is provided but is not of the type string returns null. If the
 * params parameter is not of the true object type it will be ignored If the innerHTML object key is provided the newly
 * created element's innerHTML will be set If a param key is provided with an underscore it will be converted to a
 * hyphen
 *
 * @param elem The HTML node type, defaults to 'div'
 * @param params Optional object of attributes to set on the element. innerHTML and textContent will both invoke their
 *   respective methods
 * @returns Newly created HTML node
 */
export declare const createElement: (elem?: keyof HTMLElementTagNameMap | undefined, params?: CreateElementParams) => HTMLElement;
//# sourceMappingURL=createElement.d.ts.map