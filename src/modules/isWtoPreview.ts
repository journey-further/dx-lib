/**
 * Checks if the current session is a WTO (Webtrends Optimization) preview environment.
 *
 * This function determines if the session is in a preview mode by:
 *
 * - Checking the URL query string for `_wt.pid` with a valid value.
 * - Checking the cookies for `_wt.bdebug=true`.
 *
 * @returns {boolean} `true` if the session is in WTO preview mode, otherwise `false`.
 */

export const isWtoPreview = () => {
  if (/_wt\.pid=[a-zA-Z0-9]+/gi.test(window.location.search)) return true;
  if (/_wt\.bdebug=true/gi.test(document.cookie)) return true;
  return false;
};
