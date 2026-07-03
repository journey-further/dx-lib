import { useMutationObserver } from "./useMutationObserver";
import { validateSelectors, createLogger, jfError, isFunction, isString, isNodeAsElement } from "../helpers";

const VERSION: string = "1.0";

/**
 * Interface for elementRemoved return instance
 *
 * - `init` Start listening for the requested element to be removed again
 * - `destroy` Remove the listener completely
 */
export interface JfRemoved {
  /** Introspection details for this listener: its id, selector, and whether it is currently listening */
  details: {
    id: string;
    selector: string;
    readonly isListening: boolean;
  };
  /**
   * Start listening for the requested element to be removed again
   *
   * _Note: this function is only required if you want to re-listen once the elementRemoved listener is stopped or
   * destroyed. Running it whilst the listener is already bound will just error out due to the same id being used_
   *
   * @returns
   */
  init: () => void;
  /**
   * Stop this elementRemoved listener without removing any other state — `init` restarts it
   *
   * @returns
   */
  pause: (delay?: number) => Promise<void>;
  /**
   * Completely remove this elementRemoved listener. Will stop listening for any future elements to be
   *
   * _Note: running `init` after `destroy` will restart the listener, and will treat all existing elements as **NOT**
   * found, so the callback will re-trigger for these elements_
   *
   * @returns
   */
  destroy: (delay?: number) => Promise<void>;
}

/**
 * Represents a removed callback object that tracks elements in the DOM
 *
 * @property {string} id - Unique identifier for the callback
 * @property {Function} callback - Function to execute when element is removed
 */
export type JfRemovedObject = {
  id: string;
  callback: (el: Element) => void;
};

/**
 * Initializes the global jfLib object and its elementRemoved property Ensures the required object structure exists in
 * the window object
 */
const initializeJFLib = () => {
  window.jfLib = window.jfLib || {};
  window.jfLib.elementRemoved = window.jfLib.elementRemoved || {};
};

/**
 * Creates a new mutation observer instance for the current version Initializes the observer and callbacks array in the
 * global state
 */
const createObserver = () => {
  window.jfLib.elementRemoved[VERSION] = {
    observer: useMutationObserver(`elementRemoved--${VERSION}`),
    callbacks: [],
  };
};

/**
 * Retrieves the current version's elementRemoved observer instance
 *
 * @returns The observer instance and callbacks for the current version, or undefined if not initialized
 */
const getObserver = () => {
  return window.jfLib.elementRemoved?.[VERSION];
};

/**
 * Detects when an element matching a specific CSS selector is removed from the DOM and executes a callback.
 *
 * This function monitors the DOM for elements matching the given selector being removed. Once a matching element is
 * found and satisfies optional conditions, the callback function is executed.
 *
 * The returned object provides methods to:
 *
 * - Completely remove the listener (destroy)
 * - Restart the listener (init)
 *
 * @example
 *   const e = elementRemoved(
 *     ".some_class",
 *     (el) => {
 *       console.log("it's removed!");
 *       // do something
 *     },
 *     "some_unique_id",
 *     (el) => true // optional condition check on the matched element
 *   );
 *
 *   // kill the listener
 *   e.destroy();
 *
 *   // restart the listener
 *   e.init();
 *
 * @param {string} selector - A CSS selector string used to identify the target element. _(required)_
 * @param {Function} callback - A function to execute when the element is removed. _(required)_
 * @param {string} id - A unique identifier to track elements that have already triggered the callback. Use the `<ownerId>--<childId>` convention (e.g. `"TIK_123456--hero"`) so useSPA resets/destroys sweep this resource automatically. _(required)_
 * @param {Function} conditions - Optional conditions to validate the element before triggering the callback. Must be a
 *   function that returns `true` for the callback to execute.
 * @returns Functions:
 *
 *   - `init` Function to re-init the listener once destroyed
 *   - `destroy` Function to completely remove this listener
 */

export const elementRemoved = (
  selector: string,
  callback: (el: Element) => void,
  id: string,
  conditions?: (el: Element) => boolean
): JfRemoved => {
  const log = createLogger(`[${id}] elementRemoved`);

  /**
   * Validates all input parameters for the elementRemoved function
   *
   * @returns {boolean} True if all validations pass
   * @throws {Error} If any validation fails with a descriptive message
   */
  const validateSetup = () => {
    // -- VALIDATE SELECTOR --
    if (!!!selector) {
      throw jfError("INVALID_OPTIONS", "elementRemoved setup failed: selector is not defined");
    }
    if (!isString(selector)) {
      throw jfError("INVALID_OPTIONS", "elementRemoved setup failed: selector must be a string");
    }
    if (!validateSelectors(selector)) {
      throw jfError("INVALID_OPTIONS", "elementRemoved setup failed: selector must be a valid css selector");
    }

    // -- VALIDATE CALLBACK --
    if (!!!callback) {
      throw jfError("INVALID_OPTIONS", "elementRemoved setup failed: callback is not defined");
    }
    if (!isFunction(callback)) {
      throw jfError("INVALID_OPTIONS", "elementRemoved setup failed: callback must be a function");
    }

    // -- VALIDATE ID --
    if (!!!id) {
      throw jfError("INVALID_OPTIONS", "elementRemoved setup failed: id is not defined");
    }
    if (!isString(id)) {
      throw jfError("INVALID_OPTIONS", "elementRemoved setup failed: id must be a string");
    }

    // -- VALIDATE CONDITIONS --
    if (conditions && !isFunction(conditions)) {
      throw jfError("INVALID_OPTIONS", "elementRemoved setup failed: conditions must be a function");
    }

    return true;
  };

  /**
   * Checks the element that was removed
   *
   * - Checks if extra conditions were provided, and if so, checks them against the target
   *
   * @param {Element} target - DOM element to check
   * @returns {boolean} True if passes conditions
   */
  const checkConditions = (target: Element) => {
    // check if it also matches the conditions
    if (!!conditions && typeof conditions == "function") {
      if (conditions(target) !== true) {
        log("Ignored: conditions not matched", "warn", target);
        return false;
      }
    }

    return true;
  };

  /**
   * Sets up the mutation observer to watch for new elements Creates a new observer if one doesn't exist for the current
   * version
   */
  const bindObserver = () => {
    // Setup lib
    initializeJFLib();
    // Abort if we've already added this listener as we only need one
    if (!!getObserver()) {
      log("Global observer exists", "warn");
      return;
    }

    log("Binding observer", "detail");

    try {
      // bind to html
      const target = document.querySelector("html");

      const config: MutationObserverInit = { childList: true, subtree: true };

      const mutationCallback: MutationCallback = (mutations) => {
        // the observer can outlive its environment (jsdom teardown, detached frames) - never touch a dead window
        if (typeof window === "undefined") return;
        mutations.forEach((mutation) => {
          // we only want to observe removed nodes
          if (mutation.removedNodes.length == 0) return;
          mutation.removedNodes.forEach((node) => {
            // Make sure this is nodeType 1
            if (node.nodeType !== 1) return;

            // Grab all the callbacks from our callbacks array and run them each
            getObserver().callbacks.forEach((cb) => {
              if (isFunction(cb.callback) && isNodeAsElement(node)) cb.callback(node);
            });
          });
        });
      };

      // Setup the observer
      createObserver();
      // Start it
      getObserver().observer.observe(target, config, mutationCallback);
    } catch (err) {
      log(err, "error");
    }
  };

  /** Initializes the element removed functionality. Sets up observers and processes existing elements */
  const initFunctionality = () => {
    log("Creating listener", "info");

    // 1. Check if we've already bound this callback with matching id
    const hasCallback = window.jfLib?.elementRemoved?.[VERSION]?.callbacks?.find((cb) => cb.id == id);
    if (hasCallback) {
      log("Function with this id is already bound", "error");
      return;
    }

    log("Listening", "success");

    // 2. Bind the elementRemoved observer to listen for any future changes
    bindObserver();

    // 3. Push our callback into the array
    getObserver()?.callbacks.push({
      id: id,
      callback: (target) => {
        // check whether this element matches the selector, or a child element of this element matches the selector
        if (!target.matches(selector) && !target.querySelector(selector)) {
          return;
        }

        if (!checkConditions(target)) return;

        // then run our callback
        log("Removed", "info");
        callback(target);
      },
    });
  };

  /**
   * Completely removes the elementRemoved functionality
   *
   * @param delay - Optional delay before cleanup _(default: 50ms)_
   * @returns Promise that resolves when cleanup is complete
   */
  const destroy = async (delay: number = 50) => {
    if (!window?.jfLib?.elementRemoved?.[VERSION]?.callbacks) return;

    try {
      // wait a small delay
      await new Promise((resolve) => setTimeout(resolve, delay));
      // remove the listener
      log("Removing listener", "info");
      getObserver().callbacks = getObserver().callbacks.filter((cb) => cb.id !== id);
    } catch (error) {
      log(error, "error");
    }
  };

  /**
   * Stops the elementRemoved listener — an alias of `destroy` kept for the standard handle shape (this module tracks
   * no per-element marks, so there is no extra state for `destroy` to clear)
   *
   * @param delay - Optional delay before cleanup _(default: 50ms)_
   * @returns Promise that resolves when cleanup is complete
   */
  const pause = (delay: number = 50) => destroy(delay);

  // Start the functionality
  const init = () => {
    const isValidSetup = validateSetup();
    if (isValidSetup) initFunctionality();
  };
  init();

  // Return the exposed functions
  return {
    details: {
      id,
      selector,
      get isListening() {
        return !!window?.jfLib?.elementRemoved?.[VERSION]?.callbacks?.some((cb) => cb?.id === id);
      },
    },
    init,
    pause,
    destroy,
  };
};
