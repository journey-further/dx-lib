/**
 * Redirects the current webpage to the specified URL.
 *
 * This function changes the location of the current page to the provided URL.
 *
 * @param {string} url - The URL to redirect the browser to.
 */

export const redirect = (url: string): void => {
  if (!url) throw new Error("Provide a url to redirect to as arg 1");
  window.location.assign(url);
};
