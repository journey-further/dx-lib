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
export const insertHTML = (html, selector, targetSelector, position = "afterbegin", replace = false) => {
    // Get the target element
    const target = document.querySelector(targetSelector);
    // No target so we can't do anything anyway
    if (!!!target)
        return false;
    // First query for the element we wish to add
    const existingElement = document.querySelector(selector);
    // If it exists and we do not want to replace it just exit and return false
    if (!!existingElement && replace === false)
        return false;
    // Element exists but we want to replace it
    if (!!existingElement && replace === true) {
        // Remove the existing element
        existingElement.remove();
        // Insert the new one into target
        target.insertAdjacentHTML(position, html);
        // Return true so we know it was successful
        return true;
    }
    // Element doesn't exist already and target exists so just insert the HTML
    target.insertAdjacentHTML(position, html);
    // Return true so we know it was successful
    return true;
};
