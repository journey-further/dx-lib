export const emptyElem = (elem) => {
    try {
        if (elem) {
            while (elem.firstChild) {
                elem.firstChild.remove();
            }
        }
    }
    catch (e) {
        console.log(e);
    }
};
export const replaceHTML = (elem, html) => {
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
