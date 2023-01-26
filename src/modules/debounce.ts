import { FunctionWithArgs } from "./listenForSwipe";

/**
 * Delay a function by a specified time
 *
 * @param callback Function to run
 * @param delay Time to delay in ms (default: 200)
 * @returns An anonymous function
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
