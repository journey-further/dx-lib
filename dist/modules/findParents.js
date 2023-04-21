/**
 * Recursively search for a parent element with the provided CSS Selector
 *
 * @param element The element to find the parent of
 * @param selector The CSS selector to identify the parent
 * @returns The desired HTML element or null
 */
export const findParents = (element, selector) => {
    if (!!!element.parentElement)
        return null;
    if (!!element.parentElement.matches(selector))
        return element.parentElement;
    return findParents(element.parentElement, selector);
};
