/** Check whether the current device has touch capabilities */
export const isTouchDevice = (): boolean => "ontouchstart" in window || navigator.maxTouchPoints > 0;
