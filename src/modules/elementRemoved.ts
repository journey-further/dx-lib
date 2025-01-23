import { useMutationObserver } from "./useMutationObserver";
import { validateSelectors, log as _log, isDebug, LogLevel, isFunction, isString, isNodeAsElement } from "../helpers";

const VERSION: string = "1.0";

/**
 * Interface for elementRemoved return instance
 *
 * - `init` Start listening for the requested element to be removed again
 * - `destroy` Remove the listener completely
 */
export interface JfRemoved {
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
   * Completely remove this elementRemoved listener. Will stop listening for any future elements to be
   *
   * _Note: running `init` after `destroy` will restart the listener, and will treat all existing elements as **NOT**
   * found, so the callback will re-trigger for these elements_
   *
   * @returns
   */
  destroy: (delay?: number) => void;
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
    observer: useMutationObserver(`elementRemoved-${VERSION}`),
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
 * @example
 *   elementRemoved(
 *     ".some_class",
 *     (el) => {
 *       console.log("it's removed!");
 *       // do something
 *     },
 *     "some_unique_id",
 *     () => true // optional condition check
 *   );
 *
 * @param {string} selector - A CSS selector string used to identify the target element. _(required)_
 * @param {Function} callback - A function to execute when the element is removed. _(required)_
 * @param {string} id - A unique identifier to track elements that have already triggered the callback. _(required)_
 * @param {Function} conditions - Optional conditions to validate the element before triggering the callback. Must be a
 *   function that returns `true` for the callback to execute.
 * @returns
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
  const log = (msg: string, lvl: LogLevel, debug: boolean = false, data?: unknown) => {
    if (!debug && isDebug()) return;
    _log(msg, lvl, `[${id}] elementRemoved`, data);
  };

  /**
   * Validates all input parameters for the elementRemoved function
   *
   * @returns {boolean} True if all validations pass
   * @throws {Error} If any validation fails with a descriptive message
   */
  const validateSetup = () => {
    // -- VALIDATE SELECTOR --
    if (!!!selector) {
      log("selector is not defined", "error");
      throw new Error("elementRemoved setup failed");
    }
    if (!isString(selector)) {
      log("selector must be a string", "error");
      throw new Error("elementRemoved setup failed");
    }
    if (!validateSelectors(selector)) {
      log("selector must be a valid css selector", "error");
      throw new Error("elementRemoved setup failed");
    }

    // -- VALIDATE CALLBACK --
    if (!!!callback) {
      log("callback is not defined", "error");
      throw new Error("elementRemoved setup failed");
    }
    if (!isFunction(callback)) {
      log("callback must be a function", "error");
      throw new Error("elementRemoved setup failed");
    }

    // -- VALIDATE ID --
    if (!!!id) {
      log("id is not defined", "error");
      throw new Error("elementRemoved setup failed");
    }
    if (!isString(id)) {
      log("id must be a string", "error");
      throw new Error("elementRemoved setup failed");
    }

    // -- VALIDATE CONDITIONS --
    if (conditions && !isFunction(conditions)) {
      log("conditions must be a function", "error");
      throw new Error("elementRemoved setup failed");
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
        log("Ignored: conditions not matched", "warn", true, target);
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
      log("Global observer exists", "warn", true);
      return;
    }

    log("Binding observer", "detail", true);

    try {
      // bind to html
      const target = document.querySelector("html");

      const config: MutationObserverInit = { childList: true, subtree: true };

      const mutationCallback: MutationCallback = (mutations) => {
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
    log("Creating listener", "info", true);

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
        log("Removed", "info", true);
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
    if (!!!getObserver().callbacks) return;

    try {
      // wait a small delay
      await new Promise((resolve) => setTimeout(resolve, delay));
      // remove the listener
      log("Removing listener", "error");
      getObserver().callbacks = getObserver().callbacks.filter((cb) => cb.id !== id);
    } catch (error) {
      log(error, "error");
    }
  };

  // Start the functionality
  const init = () => {
    const isValidSetup = validateSetup();
    if (isValidSetup) initFunctionality();
  };
  init();

  // Return the exposed functions
  return {
    init,
    destroy,
  };
};
