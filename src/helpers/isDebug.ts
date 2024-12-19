/**
 * Checks to see if `qa_mode=true` cookie is set, to enable advanced logging
 *
 * @returns {boolean} True if the qa_mode cookie is enabled
 */
export const isDebug = (): boolean => /jf_debug=true/.test(document.cookie);
