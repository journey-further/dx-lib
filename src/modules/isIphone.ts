/**
 * Checks whether the current user agent corresponds to any type of iPhone.
 *
 * This function uses the `navigator.userAgent` string to identify if the user is on an iPhone device.
 *
 * @returns {boolean} `true` if the user agent indicates an iPhone, otherwise `false`.
 */

export const isIphone = (): boolean => /iPhone/i.test(navigator.userAgent);
