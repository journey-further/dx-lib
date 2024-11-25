/**
 * Checks whether the current user agent corresponds to any type of mobile device.
 *
 * This function uses the `navigator.userAgent` string to identify if the user is on a mobile device, including
 * smartphones, tablets, and other portable devices.
 *
 * @returns {boolean} `true` if the user agent indicates a mobile device, otherwise `false`.
 */

export const isMobile = (): boolean =>
  /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(
    navigator.userAgent
  );
