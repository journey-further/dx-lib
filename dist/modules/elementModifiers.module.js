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
