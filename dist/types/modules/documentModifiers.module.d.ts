/**
 * Disable the ability for the user to scroll their device
 * @returns {void}
 */
export declare const preventScroll: () => void;
/**
 * Reenable the ability for the user to scroll on the device
 * @returns {void}
 */
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
export declare const insertStyle: (style: string, id: string, options?: {
    position?: "beforebegin" | "afterbegin" | "beforeend" | "afterend" | undefined;
    elem?: HTMLElement | undefined;
} | undefined) => void;
/**
 * Function to insert HTML code into a target element using insertAdjacentHTML which
 * prevents addition of duplicate elements.
 *
 * If there is no element with targetSelector return false
 *
 * If there is already an element with selector and replace is false return false
 *
 * If there is already an element with selector and replace it true, remove existing and
 * insert our HTML into target at position.
 *
 * IF there is no element with selector and target is defined insert the HTML to target
 * at position
 *
 * @param {string} html -- The HTML markup you wish to insert
 * @param {string} selector -- The selector which will identify duplicates of HTML
 * @param {string} targetSelector -- CSS selector of the element you wish insert into
 * @param {string} position -- Position for insertAdjacentHTML
 * @param {boolean} replace -- Boolean whether or not to replace an existing element with selector
 * @returns {boolean} -- Whether or not the HTML was inserted
 */
export declare const insertHTML: (html: string, selector: string, targetSelector: string, position?: "afterbegin" | "beforebegin" | "afterend" | "beforeend", replace?: boolean) => boolean;
//# sourceMappingURL=documentModifiers.module.d.ts.map