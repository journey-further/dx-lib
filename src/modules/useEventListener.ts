/**
 * An object representing an event listener added using `useEventListener`.
 *
 * This object provides details about the event listener and a method to remove it.
 *
 * - `id`: A unique identifier for the listener.
 * - `handler`: The callback function executed when the event is triggered.
 * - `element`: The DOM element the listener is attached to.
 * - `options`: Additional options passed to `addEventListener`.
 * - `eventName`: The name of the event being listened for (e.g., "click", "keydown").
 * - `disconnect`: A function to remove the event listener and clean up resources.
 */
export type JfListenerObject = {
  /** The ID of the listener */
  id: string;
  /** The callback to execute when the listener is triggered */
  handler: EventListener;
  /** The element to listen for events on */
  element: HTMLElement;
  /** Additional event listener options */
  options: AddEventListenerOptions;
  /** The name of the event to listen for */
  eventName: string;
  /**
   * A method to remove this listener
   *
   * @deprecated Use `destroy` — the library-wide teardown verb. Behaviour is identical.
   */
  disconnect: () => void;
  /** Remove this listener — the standard teardown verb (idempotent, sync, never throws) */
  destroy: () => void;
};

/**
 * Extends the `Window` interface to include a globally scoped array of `JfListenerObject` instances.
 *
 * This global array (`window.jfListeners`) is used to track all active event listeners, allowing for centralized
 * management and cleanup of listeners across the application. It ensures that duplicate listeners are not added and
 * that listeners can be removed efficiently when no longer needed.
 */
declare global {
  interface Window {
    jfListeners: JfListenerObject[];
  }
}

/**
 * Adds an event listener to an element and tracks it globally to prevent duplicates and manage cleanup.
 *
 * This function attaches an event listener to the specified element and ensures:
 *
 * - Listeners with the same ID are not added multiple times.
 * - Existing listeners are removed if they conflict with the new one.
 * - A `disconnect` method is provided to easily remove the listener and clean up its record.
 *
 * This is especially useful in Single Page Applications (SPAs) where listeners might persist across page transitions,
 * preventing memory leaks or unexpected behaviour. It can also be helpful in static sites to avoid duplicate
 * listeners.
 *
 * @param {string} id - A unique ID for the listener to track it globally. Use the `<ownerId>--<childId>` convention (e.g. `"TIK_123456--hero"`) so useSPA resets/destroys sweep this resource automatically.
 * @param {HTMLElement} element - The element to attach the listener to.
 * @param {string} eventName - The name of the event to listen for (e.g., "click", "keydown").
 * @param {EventListener} handler - The function to execute when the event is triggered.
 * @param {AddEventListenerOptions} [options] - Optional settings for the listener (e.g., `capture`, `once`).
 * @returns {JfListenerObject} An object containing details about the listener and a method to remove it.
 */

export const useEventListener = (
  id: string,
  element: HTMLElement,
  eventName: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): JfListenerObject => {
  if (typeof id !== "string") throw new Error("Arg 1 must be of type string");
  if (!(element instanceof HTMLElement)) throw new Error("Arg 2 must be a HTMLElement");
  if (typeof eventName !== "string") throw new Error("Arg 3 must be of type string");
  if (typeof handler !== "function") throw new Error("Arg 4 must be of type function");
  if (typeof options !== "object" && options) throw new Error("Arg 5 must be an object or undefined");
  // define the array in case there isnt one
  window.jfListeners = window.jfListeners || [];
  // define callback to remove this listener
  const disconnect = () => {
    element.removeEventListener(eventName, handler, options);
    window.jfListeners = window.jfListeners.filter((l) => l.id !== id);
  };

  // See if a listener with this ID has been added already
  const currentListener = window.jfListeners.find((listener) => listener.id === id);
  // remove the current listener if the element is still in the DOM
  if (currentListener && document.documentElement.contains(currentListener.element)) {
    currentListener.disconnect?.();
  }

  //cleanup the array
  if (currentListener) {
    window.jfListeners = window.jfListeners.filter((listener) => listener.id !== id);
  }
  // Add the listener
  element?.addEventListener(eventName, handler, options);
  // object to return and push to window
  const listenerObject = { element, eventName, id, handler, options, disconnect, destroy: disconnect };
  // Push the object
  window.jfListeners.push(listenerObject);
  // Return method to remove it
  return listenerObject;
};
