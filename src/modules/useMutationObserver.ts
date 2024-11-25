/**
 * An object with information relating to a mutation observer applied by `useMutationObserver`.
 *
 * This object is used to track the state and configuration of a `MutationObserver` instance.
 *
 * - `observer`: The active `MutationObserver` instance, or `undefined` if no observer is currently active.
 * - `isObserving`: A flag indicating whether the observer is currently observing changes.
 * - `ticketId`: A unique identifier for the observer, used to manage multiple observers globally.
 */
export interface JfObserverObject {
  observer: MutationObserver | undefined;
  isObserving: boolean;
  ticketId: string;
}

/**
 * A wrapper type for the `observe` method in the Mutation Observer API.
 *
 * This function starts observing a target node for DOM changes based on the provided configuration and callback.
 *
 * - `target`: The DOM node to observe.
 * - `config`: The configuration object specifying which mutations to observe (e.g., child list, attributes).
 * - `callback`: The function to execute when mutations are detected.
 *
 * @returns {boolean} `true` if the observer started successfully, or `false` if it is already observing.
 */
export type JfObserveFunction = (target: Node, config: MutationObserverInit, callback: MutationCallback) => boolean;

/**
 * The object returned by the `useMutationObserver` function.
 *
 * This object encapsulates all the details and methods for managing a `MutationObserver`.
 *
 * - `details`: Contains information about the observer (see `JfObserverObject`).
 * - `disconnect`: A method to stop observing and clean up resources.
 * - `observe`: A method to start observing a target node for mutations.
 */
export interface JfObserver {
  details: JfObserverObject;
  disconnect: () => void;
  observe: JfObserveFunction;
}

/**
 * Extends the `Window` interface to include a globally scoped array of `JfObserverObject` instances.
 *
 * This global array (`window.jfObservers`) is used to track all active observers, allowing for centralized management
 * and cleanup of observers across the application.
 */
declare global {
  interface Window {
    jfObservers: JfObserverObject[];
  }
}

/**
 * Scoped MutationObserver wrapper that prevents duplicate observers and manages them globally to avoid memory leaks.
 *
 * This utility creates and manages a `MutationObserver` scoped to a specific ID. It uses a globally scoped
 * `jfObservers` array on the `window` object to track and manage active observers. This ensures that observers can be
 * cleaned up efficiently, especially during page changes (particularly relevant for Single Page Apps)
 *
 * To use, define an observer within a `STATE` object to init the observer, and then bind it's functionality (target,
 * config and callback) in your code.
 *
 * ```javascript
 * const STATE = {
 *   observer: useMutationObserver("ABC_123456"),
 * };
 *
 * STATE.observer.observe(target, { childList: true }, () => {});
 * ```
 *
 * The returned object provides methods to:
 *
 * - Start observing a DOM node with specific configurations (`observe`).
 * - Stop observing and clean up resources (`disconnect`).
 *
 * @param {string} id - The unique ID for the observer.
 * @returns {JfObserver} An object containing details of the observer, and functions to manage its lifecycle.
 * @interface JfObserverObject
 * - observer: The `MutationObserver` instance (or `undefined` if not active).
 * - isObserving: A boolean indicating if the observer is active.
 * - ticketId: The unique ID for the observer.
 *
 * @interface JfObserver
 * - details: The `JfObserverObject` containing observer details.
 * - disconnect: A function to disconnect and clean up the observer.
 * - observe: A function to start observing a target node with specific configurations and a callback.
 */

export const useMutationObserver = (id: string): JfObserver => {
  // Get the current observer array
  window.jfObservers = window.jfObservers || [];
  // Get the current observer object
  let observerObject: JfObserverObject | undefined = window.jfObservers.find(
    (obs: JfObserverObject) => obs.ticketId === id
  );
  // No current object in global array
  if (!observerObject) {
    // Make one
    observerObject = {
      observer: undefined,
      isObserving: false,
      ticketId: id,
    };
    // Push this instance to the global array
    window.jfObservers.push(observerObject);
  }

  const wrappedObserve: JfObserveFunction = (target, config, callback) => {
    // Check if we are already observing
    if (observerObject.isObserving) {
      return false;
    }
    // Observe if not
    observerObject.observer = new MutationObserver(callback);
    observerObject.observer.observe(target, config);
    observerObject.isObserving = true;
    return true;
  };

  /** Wrapper for the native disconnect function from the Mutation Observer API */
  const wrappedDisconnect = () => {
    observerObject.observer?.disconnect();
    observerObject.observer = undefined;
    observerObject.isObserving = false;
    // Remove this instance from the global array
    window.jfObservers = window.jfObservers.filter((obs: JfObserverObject) => obs.ticketId !== id);
  };

  return {
    details: observerObject,
    observe: wrappedObserve,
    disconnect: wrappedDisconnect,
  };
};
