/**
 * Checks whether the current device supports touch capabilities.
 *
 * This function detects touch capability by checking if the `ontouchstart` property exists in the `window` object or if
 * the device reports a positive number of touch points.
 *
 * @returns {boolean} `true` if the device supports touch input, otherwise `false`.
 */

export const isTouchDevice = (): boolean => "ontouchstart" in window || navigator.maxTouchPoints > 0;
