/** Check whether the current user agent is for an iPhone of any kind */
export const isIphone = (): boolean => /iPhone/i.test(navigator.userAgent);
