/**
 * Return a unique string to be used as a HTML ID
 *
 * @returns A unique ID
 */
export const generateId = () => {
    let id;
    while (!!!id || /^\d/.test(id) || !!document.querySelector(`#${id}`)) {
        id = Math.random().toString(36).substring(2, 9);
    }
    return id;
};
