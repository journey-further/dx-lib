/**
 * Redirect the current webpage to the URL which as been passed as an argument.
 * @param {string} url The URL to redirect to
 * @returns {void}
 */
export var redirect = function (url) {
    if (!url)
        return;
    window.location.href = url;
};
