/**
 * Redirect the current webpage to the URL which as been passed as an argument.
 * @param {string} url The URL to redirect to
 * @returns {void}
 */

export const redirect = (url: string): void => {
  if (!url) return;
  window.location.href = url;
};
