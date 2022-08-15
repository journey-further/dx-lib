/**
 *  Remove all child nodes of the element provided in the arguments.
 *
 *  This will also remove text and comment nodes.
 *
 * @param {HTMLElement} elem The HTML element to remove children from
 */
var emptyElem = function (elem) {
    if (!!!elem)
        throw new Error("Function requires an argument");
    if (!(elem instanceof HTMLElement))
        throw new Error("Argument 1 must be a HTMLElement");
    while (elem.firstChild) {
        elem.firstChild.remove();
    }
};
/**
 * Replace the HTML content of the provided element with the string passed as the 2nd argument
 * @param {HTMLElement} elem
 * @param {string} html
 */
var replaceHTML = function (elem, html) {
    if (!!!elem)
        throw new Error("You did not provide an element");
    if (!(elem instanceof HTMLElement))
        throw Error("Parameter 1 must be a HTML element");
    if (!!!html)
        throw new Error("You did not provide any HTML markup");
    if (typeof html !== "string")
        throw Error("Parameter 2 must be a string");
    emptyElem(elem);
    elem.insertAdjacentHTML("afterbegin", html);
};

export { emptyElem, replaceHTML };
