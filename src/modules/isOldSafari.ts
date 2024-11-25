/**
 * Checks whether the current user agent corresponds to an older version of the Safari browser.
 *
 * This function uses the `navigator.userAgent` string to identify Safari browsers with versions 1 through 13.
 *
 * @returns {boolean} `true` if the user agent indicates an old Safari browser, otherwise `false`.
 */

export const isOldSafari = (): boolean =>
  /version\/(?:1|2|3|4|5|6|7|8|9|10|11|12|13)\.[\w\s/\d.]+safari/gi.test(navigator.userAgent);
