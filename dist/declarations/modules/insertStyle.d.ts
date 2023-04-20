/**
 * Add the passed style string to either the options.elem element or the document body.
 *
 * If no options.position value is provided we will default to "beforeend".
 *
 * If no options.elem is provided we will default to document.body
 *
 * @param style -- A CSS string
 * @param id Ticket ID to prevent duplicate additions
 * @param options -- Config options for the insert, position
 * @param options.position Insert position accepted by insertAdjacentHTML and elem is a HTML element
 * @param options.elem A HTMLElement to insert the style into
 */
export declare const insertStyle: (style: string, id: string, options?: {
    position?: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
    elem?: HTMLElement;
}) => void;
//# sourceMappingURL=insertStyle.d.ts.map