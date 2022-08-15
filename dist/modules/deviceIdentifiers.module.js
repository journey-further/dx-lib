/**
 * Check whether the current user agent is for an iPhone of any kind
 * @returns {boolean}
 */
var isIphone = function () { return /iPhone/i.test(navigator.userAgent); };
/**
 * Check whether the current user agent is a mobile device of any kind
 * @returns {boolean}
 */
var isMobile = function () {
    return /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(navigator.userAgent);
};
/**
 * Check whether the current user agent is for an old Safari browser
 * @returns {boolean}
 */
var isOldSafari = function () {
    return /version\/(?:1|2|3|4|5|6|7|8|9|10|11)\.[\w\s/\d.]+safari/gi.test(navigator.userAgent);
};

export { isIphone, isMobile, isOldSafari };
