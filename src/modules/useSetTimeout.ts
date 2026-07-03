/**
 * Represents a managed timer created using `useSetTimeout`.
 *
 * This object contains details about the timer, its configuration, and a method to clear it.
 *
 * - `id`: A unique identifier for the timer.
 * - `timer`: The `setTimeout` instance for the timer.
 * - `timeout`: The time, in milliseconds, to wait before executing the handler.
 * - `handler`: The function to execute when the timer expires.
 * - `disconnect`: A method to clear the timer and remove it from the global `window.jfLib.timers` registry.
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

const VERSION = "1.0";

/** Lazily initialise and return the versioned timer registry */
const getRegistry = (): JfTimerObject[] => {
  window.jfLib = window.jfLib || {};
  window.jfLib.timers = window.jfLib.timers || {};
  window.jfLib.timers[VERSION] = window.jfLib.timers[VERSION] || [];
  return window.jfLib.timers[VERSION];
};

/**
 * Creates a managed `setTimeout` instance and tracks it globally to prevent duplicates and enable cleanup.
 *
 * This function wraps the `setTimeout` method, adding the timer to the globally scoped `window.jfLib.timers`
 * registry. It ensures:
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
  // See if we have a timeout with this ID already
  const currentTimeout = getRegistry().find((timer) => timer.id === id);
  if (!!currentTimeout) {
    currentTimeout.disconnect();
  }
  // get a new one
  const timer = setTimeout(() => {
    // remove the object from the registry
    window.jfLib.timers[VERSION] = getRegistry().filter((timers) => timers.id !== id);
    // execute the handler
    handler();
  }, timeout);
  // Disconnect this timer
  const disconnect = () => {
    clearTimeout(timer);
    window.jfLib.timers[VERSION] = getRegistry().filter((timers) => timers.id !== id);
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
  // push the object to the registry so we can clear it
  getRegistry().push(timerObj);
  // return it so we can use in a test
  return timerObj;
};
