import { FunctionWithArgs } from "types/generic";

/**
 * Delay a function by a specified time
 *
 * @param {FunctionWithArgs} callback Function to run
 * @param {number} delay Time to delay in ms (default: 200)
 * @returns {FunctionWithArgs} An anonymous function
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
