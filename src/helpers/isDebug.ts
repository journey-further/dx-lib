/**
 * Checks to see if `jf_debug=true` cookie is set, to enable advanced logging
 *
 * @returns {boolean} True if the jf_debug cookie is present and set to true
 */
export const isDebug = (): boolean => /jf_debug=true/.test(document.cookie);
