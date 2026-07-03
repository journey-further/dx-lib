/**
 * Represents a managed timer created using `useSetTimeout`.
 *
 * This object contains details about the timer, its configuration, and a method to clear it.
 *
 * - `id`: A unique identifier for the timer.
 * - `timer`: The `setTimeout` instance for the timer.
 * - `timeout`: The time, in milliseconds, to wait before executing the handler.
 * - `handler`: The function to execute when the timer expires.
 * - `disconnect`: A method to clear the timer and remove it from the global `jfTimers` array.
 */

export type JfTimerObject = {
  id: string;
  timer: ReturnType<typeof setTimeout>;
  timeout: number;
  handler: () => void;
  /**
   * Clear this timer
   *
   * @deprecated Use `destroy` - the library-wide teardown verb. Behaviour is identical.
   */
  disconnect: () => void;
  /** Clear this timer - the standard teardown verb (idempotent, sync, never throws) */
  destroy: () => void;
};

/**
 * Extends the `Window` interface to include a globally scoped array of `JfTimerObject` instances.
 *
 * The `window.jfTimers` array tracks all active timers created with `useSetTimeout`, allowing centralized management
 * and cleanup. This is particularly useful in Single Page Applications (SPAs) to prevent timers from persisting across
 * page transitions.
 */
declare global {
  interface Window {
    jfTimers: JfTimerObject[];
  }
}

/**
 * Creates a managed `setTimeout` instance and tracks it globally to prevent duplicates and enable cleanup.
 *
 * This function wraps the `setTimeout` method, adding the timer to a globally scoped `jfTimers` array on the `window`
 * object. It ensures:
 *
 * - No duplicate timers are added (timers with the same ID are cleared and replaced).
 * - Timers can be tracked and removed easily, especially in Single Page Applications (SPAs) during page transitions.
 * - A `disconnect` method is provided to clear the timer manually if needed.
 *
 * @param {() => void} handler - A function to execute when the timer expires. _(Required)_
 * @param {number} timeout - The time, in milliseconds, to wait before executing the handler. _(Required)_
 * @param {string} id - A unique identifier for the timer. Use the `<ownerId>--<childId>` convention (e.g. `"TIK_123456--hero"`) so useSPA resets/destroys sweep this resource automatically. _(Required)_
 * @returns {JfTimerObject} An object containing details about the timer and a method to clear it.
 */

export const useSetTimeout = (handler: () => void, timeout: number, id: string): JfTimerObject => {
  if (typeof handler !== "function") throw new Error("Arg 1 must be a function");
  if (!timeout || typeof timeout !== "number") throw new Error("Arg 2 must be a number");
  if (!id || typeof id !== "string") throw new Error("Arg 3 must be a string");
  // init an array if one isnt there
  window.jfTimers = window.jfTimers || [];
  // See if we have a timeout with this ID already
  const currentTimeout = window.jfTimers.find((timer) => timer.id === id);
  if (!!currentTimeout) {
    currentTimeout.disconnect();
  }
  // get a new one
  const timer = setTimeout(() => {
    // remove the object from the window array;
    window.jfTimers = window.jfTimers.filter((timers) => timers.id !== id);
    // execute the handler
    handler();
  }, timeout);
  // Disconnect this timer
  const disconnect = () => {
    clearTimeout(timer);
    window.jfTimers = window.jfTimers.filter((timers) => timers.id !== id);
  };
  // make an object
  const timerObj = {
    id,
    timer,
    timeout,
    handler,
    disconnect,
    destroy: disconnect,
  };
  // push the object to our array so we can clear it
  window.jfTimers.push(timerObj);
  // return it so we can use in a test
  return timerObj;
};
