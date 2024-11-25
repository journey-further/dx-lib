import { FunctionWithArgs } from "./listenForSwipe";

/**
 * Creates a debounced version of a function that delays its execution until after a specified wait time.
 *
 * This utility helps in limiting the rate at which a function is invoked. The function will only execute after the
 * specified delay period has passed since the last time it was called.
 *
 * @param {Function} callback - The function to be executed after the delay.
 * @param {number} [delay=200] - The time to delay execution. Default is `200`
 * @returns {Function} A debounced version of the provided function.
 */

export function debounce(callback: FunctionWithArgs, delay = 200) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}
