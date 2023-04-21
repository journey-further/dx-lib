/**
 * Function to insert HTML code into a target element using insertAdjacentHTML which prevents addition of duplicate
 * elements.
 *
 * If there is no element with targetSelector return false
 *
 * If there is already an element with selector and replace is false return false
 *
 * If there is already an element with selector and replace it true, remove existing and insert our HTML into target at
 * position.
 *
 * IF there is no element with selector and target is defined insert the HTML to target at position
 *
 * @param html -- The HTML markup you wish to insert
 * @param selector -- The selector which will identify duplicates of HTML
 * @param targetSelector -- CSS selector of the element you wish insert into
 * @param position -- Position for insertAdjacentHTML
 * @param replace -- Boolean whether or not to replace an existing element with selector
 * @returns -- Whether or not the HTML was inserted
 */
export declare const insertHTML: (html: string, selector: string, targetSelector: string, position?: "afterbegin" | "beforebegin" | "afterend" | "beforeend", replace?: boolean) => boolean;
//# sourceMappingURL=insertHTML.d.ts.map