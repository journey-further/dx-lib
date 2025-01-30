import { isDebug, isNodeArray, isNodeList, LogLevel, log as _log } from "../helpers";

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
  /** The active `MutationObserver` instance, or `undefined` if no observer is currently active. */
  observer: MutationObserver | undefined;
  /** A flag indicating whether the observer is currently observing changes. */
  isObserving: boolean;
  /** A unique identifier for the observer, used to manage multiple observers globally. */
  ticketId: string;
}

/**
 * A wrapper type for the `observe` method in the Mutation Observer API.
 *
 * This function starts observing a target node for DOM changes based on the provided configuration and callback.
 *
 * - `target`: The DOM node or nodes to observe.
 * - `config`: The configuration object specifying which mutations to observe (e.g., child list, attributes).
 * - `callback`: The function to execute when mutations are detected.
 *
 * @returns {boolean} `true` if the observer started successfully, or `false` if it is already observing.
 */
export type JfObserveFunction = (
  target: Node | Node[] | NodeList,
  config: MutationObserverInit,
  callback: MutationCallback
) => boolean;

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
  /**
   * Get details of the observer
   *
   * @example
   *   if(STATE.observer.details.isObserving) ...
   *
   * @param {MutationObserver | undefined} observer The active `MutationObserver` instance, or `undefined` if no
   *   observer is currently active.
   * @param {boolean} isObserving A flag indicating whether the observer is currently observing changes.
   * @param {string} ticketId A unique identifier for the observer, used to manage multiple observers globally.
   */
  details: JfObserverObject;
  /**
   * Disconnect the observer, removing it from the DOM
   *
   * @example
   *   if (STATE.observer.details.isObserving) STATE.observer.disconnect();
   */
  disconnect: () => void;
  /**
   * Bind the observer to an element and start watching for changes. If no target exists, or the target fails to match,
   * this will error out
   *
   * @example
   *   const watchForChanges = () => {
   *     // Get a target
   *     const target = document.querySelector(".some--class"); // can also use document.querySelectorAll(...)
   *     if (!!!target) return;
   *
   *     // Setup the config
   *     const config = { childList: true };
   *
   *     // Create a callback
   *     const callback = (mutations) => {
   *       mutations.forEach((mutation) => {
   *         // do something
   *       });
   *     };
   *
   *     // Start observing
   *     STATE.observer.observe(target, config, callback);
   *   };
   *
   * @param {Node | Node[] | NodeList<Node>} target The target(s) to bind the mutation observer to
   * @param {MutationObserverInit} config The
   *   [`MutationObserverInit`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options)
   *   config to apply to the observer
   * @param {MutationCallback} config The
   *   [`MutationCallback`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver#callback)
   *   callback to run when a mutation is detected
   */
  observe: JfObserveFunction;
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
 * The returned object provides methods to:
 *
 * - Start observing a DOM node with specific configurations (`observe`).
 * - Stop observing and clean up resources (`disconnect`).
 *
 * @example
 *   const STATE = {
 *     observer: useMutationObserver("ABC_123456"),
 *   };
 *
 *   STATE.observer.observe(target, { childList: true }, () => {});
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
  const log = (msg: string, lvl: LogLevel, debug: boolean = false, data?: unknown) => {
    if (!!debug && !isDebug()) return;
    _log(msg, lvl, `[${id}] useMutationObserver`, data);
  };

  const isCoreFn = /pageChange|reInit|element(Ready|Updated|Removed)/.test(id);

  // Get the current observer array
  window.jfObservers = window.jfObservers || [];
  // Get the current observer object
  let observerObject: JfObserverObject | undefined = window.jfObservers.find(
    (obs: JfObserverObject) => obs.ticketId === id
  );

  if (!observerObject) {
    observerObject = {
      observer: undefined,
      isObserving: false,
      ticketId: id,
    };
    // Push new instance to the global array
    window.jfObservers.push(observerObject);
    log("Created observer", "info", isCoreFn);
  } else {
    // Warn the user it's already been bound
    log("ID is already bound", "warn", isCoreFn);
  }

  const wrappedObserve: JfObserveFunction = (target, config, callback) => {
    // Check if we are already observing
    if (observerObject.isObserving) {
      return false;
    }
    // Observe if not
    observerObject.observer = new MutationObserver(callback);
    // if we've got an array of targets, add an observer to each one
    if (isNodeArray(target) || isNodeList(target)) {
      target.forEach((node: Node) => {
        observerObject.observer.observe(node, config);
      });
    } else {
      observerObject.observer.observe(target, config);
    }

    observerObject.isObserving = true;
    log("Observing", "success", isCoreFn);
    return true;
  };

  /** Wrapper for the native disconnect function from the Mutation Observer API */
  const wrappedDisconnect = () => {
    observerObject.observer?.disconnect();
    observerObject.observer = undefined;
    observerObject.isObserving = false;
    // Remove this instance from the global array
    window.jfObservers = window.jfObservers.filter((obs: JfObserverObject) => obs.ticketId !== id);
    log("Disconnected observer", "error");
  };

  return {
    details: observerObject,
    observe: wrappedObserve,
    disconnect: wrappedDisconnect,
  };
};
