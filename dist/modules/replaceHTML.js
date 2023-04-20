/**
 * Replace the HTML content of the provided element with the string passed as the 2nd argument
 *
 * @param elem The element which we want to replace the HTML of
 * @param html The HTML to insert into the element
 */
export const replaceHTML = (elem, html) => {
    if (!!!elem)
        throw new Error("Provide a HTML element as arg 1");
    if (!(elem instanceof HTMLElement))
        throw Error("Parameter 1 must be a HTML element");
    if (!!!html)
        throw new Error("Provide HTML markup as arg 2");
    if (typeof html !== "string")
        throw Error("Parameter 2 must be a string");
    while (elem.childNodes.length > 0) {
        elem.firstChild.remove();
    }
    elem.textContent = "";
    elem.insertAdjacentHTML("afterbegin", html);
};
