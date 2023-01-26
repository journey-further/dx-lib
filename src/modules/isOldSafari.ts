/** Check whether the current user agent is for an old Safari browser */
export const isOldSafari = (): boolean =>
  /version\/(?:1|2|3|4|5|6|7|8|9|10|11)\.[\w\s/\d.]+safari/gi.test(navigator.userAgent);
