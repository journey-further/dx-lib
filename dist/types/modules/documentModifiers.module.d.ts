export declare const preventScroll: () => void;
export declare const enableScroll: () => void;
/**
 * Add the passed style string to either the options.elem element or the document body.
 *
 * If no options.position value is provided we will default to "beforeend".
 *
 * If no options.elem is provided we will default to document.body
 *
 * @param {string} style -- A CSS string
 * @param {string} ticket -- Ticket ID to prevent duplicate additions
 * @param {object} options -- Config options for the insert, position
 * is an insert position accepted by insertAdjacentHTML and elem is a HTML element
 */
export declare const insertStyle: (style: string, ticket: string, options?: {
    position?: "beforebegin" | "afterbegin" | "beforeend" | "afterend" | undefined;
    elem?: HTMLElement | undefined;
} | undefined) => void;
//# sourceMappingURL=documentModifiers.module.d.ts.map