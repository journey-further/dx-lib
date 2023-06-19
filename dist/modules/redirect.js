/**
 * Redirect the current webpage to the URL which as been passed as an argument.
 *
 * @param url The URL to redirect to
 */
export const redirect = (url) => {
    if (!url)
        throw new Error("Provide a url to redirect to as arg 1");
    window.location.assign(url);
};
