/**
 * Redirect the current webpage to the URL which as been passed as an argument.
 *
 * @param url The URL to redirect to
 */

export const redirect = (url: string): void => {
  if (!url) return;
  window.location.assign(url);
};
