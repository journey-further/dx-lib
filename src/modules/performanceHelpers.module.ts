/**
 * Delay a callback function by a set amount
 * @param callback Function to run
 * @param delay Time in ms to delay (default: 200)
 * @returns
 */
export function debounce(callback, delay = 200) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}
