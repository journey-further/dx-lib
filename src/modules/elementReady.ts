import { useMutationObserver } from "./useMutationObserver";
import { validateSelectors, log as _log, isDebug, LogLevel, isFunction, isString, isNodeAsElement } from "../helpers";

const VERSION: string = "1.0";

/**
 * Interface for elementReady return instance
 *
 * - `init` Start listening for the requested element to be ready again
 * - `pause` Pause the listener
 * - `destroy` Remove the listener completely
 */
export interface JfReady {
  /**
   * Start listening for the requested element to be ready again
   *
   * _Note: this function is only required if you want to re-listen once the elementReady listener is stopped or
   * destroyed. Running it whilst the listener is already bound will just error out due to the same id being used_
   *
   * @returns
   */
  init: () => void;
  /**
   * Stop this elementReady listener. This will stop listening for any future elements to become ready, but will not
   * remove ready flags on any existing elements.
   *
   * _Note: running `init` after `stop` will restart the listener, and will treat all existing elements as already
   * found_
   *
   * @returns
   */
  pause: () => Promise<void>;
  /**
   * Completely remove this elementReady listener. Will stop listening for any future elements to be
   *
   * _Note: running `init` after `destroy` will restart the listener, and will treat all existing elements as **NOT**
   * found, so the callback will re-trigger for these elements_
   *
   * @returns
   */
  destroy: (delay?: number) => Promise<void>;
}

/**
 * Represents a ready callback object that tracks elements in the DOM
 *
 * @property {string} id - Unique identifier for the callback
 * @property {Function} callback - Function to execute when element is found
 */
export type JfReadyObject = {
  id: string;
  callback: (el: Element) => void;
};

/**
 * Initializes the global jfLib object and its elementReady property Ensures the required object structure exists in the
 * window object
 */
const initializeJFLib = () => {
  window.jfLib = window.jfLib || {};
  window.jfLib.elementReady = window.jfLib.elementReady || {};
};

/**
 * Creates a new mutation observer instance for the current version Initializes the observer and callbacks array in the
 * global state
 */
const createObserver = () => {
  window.jfLib.elementReady[VERSION] = {
    observer: useMutationObserver(`elementReady-${VERSION}`),
    callbacks: [],
  };
};

/**
 * Retrieves the current version's elementReady observer instance
 *
 * @returns The observer instance and callbacks for the current version, or undefined if not initialized
 */
const getObserver = () => {
  return window.jfLib.elementReady?.[VERSION];
};

/**
 * Detects when an element matching a specific CSS selector is added to the DOM and executes a callback.
 *
 * This function monitors the DOM for elements matching the given selector. Once a matching element is found and
 * satisfies optional conditions, the callback function is executed. Each element is marked as "ready" after the
 * callback has run, preventing duplicate executions.
 *
 * The returned object provides methods to:
 *
 * - Pause the listener (pause)
 * - Completely remove the listener (destroy)
 * - Restart the listener (init)
 *
 * @example
 *   const e = elementReady(
 *     ".some_class",
 *     (el) => {
 *       console.log("it's ready!");
 *       // do something
 *     },
 *     "some_unique_id",
 *     () => true // optional condition check on the matched element
 *   );
 *
 *   // pause the listener - stops future listening but keeps all currently "ready" elements
 *   e.pause();
 *
 *   // kill the listener - stops future listening and unmarks everything as not ready
 *   e.destroy();
 *
 *   // restart the listener
 *   e.init();
 *
 * @param {string} selector - A CSS selector string used to identify the target element. _(required)_
 * @param {Function} callback - A function to execute when the element is found. Receives the element as its parameter.
 *   _(required)_
 * @param {string} id - A unique identifier to track elements that have already triggered the callback. _(required)_
 * @param {Function} conditions - Optional conditions to validate the element before triggering the callback. Must be a
 *   function that returns `true` for the callback to execute.
 * @returns Functions:
 *
 *   - `init` Function to re-init the listener once destroyed
 *   - `pause` Function to remove the listener, but keep everything currently found as 'ready'
 *   - `destroy` Function to completely remove this listener, and unmark everything found as 'ready'
 */

export const elementReady = (
  selector: string,
  callback: (el: Element) => void,
  id: string,
  conditions?: (el: Element) => boolean
): JfReady => {
  const log = (msg: string, lvl: LogLevel, debug: boolean = false, data?: unknown) => {
    if (!!debug && !isDebug()) return;
    _log(msg, lvl, `[${id}] elementReady`, data);
  };

  /**
   * Validates all input parameters for the elementReady function
   *
   * @returns {boolean} True if all validations pass
   * @throws {Error} If any validation fails with a descriptive message
   */
  const validateSetup = () => {
    // -- VALIDATE SELECTOR --
    if (!!!selector) {
      log("selector is not defined", "error");
      throw new Error("elementReady setup failed");
    }
    if (!isString(selector)) {
      log("selector must be a string", "error");
      throw new Error("elementReady setup failed");
    }
    if (!validateSelectors(selector)) {
      log("selector must be a valid css selector", "error");
      throw new Error("elementReady setup failed");
    }

    // -- VALIDATE CALLBACK --
    if (!!!callback) {
      log("callback is not defined", "error");
      throw new Error("elementReady setup failed");
    }
    if (!isFunction(callback)) {
      log("callback must be a function", "error");
      throw new Error("elementReady setup failed");
    }

    // -- VALIDATE ID --
    if (!!!id) {
      log("id is not defined", "error");
      throw new Error("elementReady setup failed");
    }
    if (!isString(id)) {
      log("id must be a string", "error");
      throw new Error("elementReady setup failed");
    }

    // -- VALIDATE CONDITIONS --
    if (conditions && !isFunction(conditions)) {
      log("conditions must be a function", "error");
      throw new Error("elementReady setup failed");
    }

    return true;
  };

  /**
   * Checks the element for readiness
   *
   * - Checks if extra conditions were provided, and if so, checks them against the target
   *
   * @param {Element} target - DOM element to check
   * @returns {boolean} True if passed conditions
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
   * Checks the element for readiness
   *
   * - Validates that it hasn't already been marked as ready
   * - Checks if extra conditions were provided, and if so, checks them against the target
   * - Marks the element as having been ready
   * - Runs the provided callback with the element
   *
   * @param {Element} target - DOM element to check
   */
  const checkElement = (target: Element) => {
    // if it's already been marked as ready, then skip this
    if (target?.jfReady?.includes(id)) {
      log("Ignored: Already marked as ready", "warn", true, target);
      return;
    }

    // check if it also matches the conditions
    if (!checkConditions(target)) return;

    // mark it as ready
    target.jfReady = target.jfReady || [];
    target.jfReady.push(id);
    target.setAttribute("jf-ready", "");

    // then run our callback
    log("Element found", "info", true);
    callback(target);
  };

  /**
   * Searches the existing DOM for elements matching the selector Processes any matching elements that haven't been
   * handled yet
   */
  const checkDOMElements = () => {
    log("Checking existing elements", "info", true);
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      checkElement(element);
    });
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
          // we only want to observe added nodes
          if (mutation.addedNodes.length == 0) return;
          mutation.addedNodes.forEach((node) => {
            // Make sure this is nodeType 1
            if (node.nodeType !== 1) return;

            // Grab all the callbacks from our callbacks array and run them each
            getObserver().callbacks.forEach((cb) => {
              if (isFunction(cb.callback) && isNodeAsElement(node)) {
                cb.callback(node);
              }
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

  /** Initializes the element ready functionality. Sets up observers and processes existing elements */
  const initFunctionality = () => {
    try {
      log("Creating listener", "info", true);

      // 1. Check if we've already bound this callback with matching id
      const hasCallback = window.jfLib?.elementReady?.[VERSION]?.callbacks?.find((cb) => cb.id == id);
      if (hasCallback) {
        log("ID already bound", "error");
        return;
        // await destroy(0);
      }

      // 2. Bind the elementReady observer to listen for any future changes
      bindObserver();

      // 3. Push our callback into the array
      getObserver()?.callbacks.push({
        id: id,
        callback: (target) => {
          // check whether this element matches the selector, or a child element of this element matches the selector
          if (!target.matches(selector) && !target.querySelector(selector)) {
            return;
          }

          // Loop the dom again to find any elements
          checkDOMElements();
        },
      });

      log("Listening", "success");

      // 4. Loop the dom initially to find any that already exist
      checkDOMElements();
    } catch (err) {
      log(err, "error");
    }
  };

  /**
   * Pauses the elementReady functionality, but does not mark the existing elements as not being ready
   *
   * @param delay - Optional delay before cleanup _(default: 50ms)_
   * @returns Promise that resolves when cleanup is complete
   */
  const pause = async (delay: number = 50) => {
    if (!!!getObserver().callbacks) return;

    try {
      // wait a small delay
      await new Promise((resolve) => setTimeout(resolve, delay));
      // remove the listener
      log("Pausing listener", "warn");
      getObserver().callbacks = getObserver().callbacks.filter((cb) => cb.id !== id);
    } catch (error) {
      log(error, "error");
    }
  };

  /** Remove our callback from the callback array */
  const removeCallback = () => {
    if (!window?.jfLib?.elementReady?.[VERSION]) return;
    window.jfLib.elementReady[VERSION].callbacks = window.jfLib.elementReady[VERSION].callbacks.filter(
      (cb) => cb.id !== id
    );
  };

  /**
   * Completely removes the elementReady functionality
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
      removeCallback();
      // also search the dom for any current elements and mark them as no longer ready
      document.querySelectorAll("body *").forEach((el) => {
        // Ignore if we don't have a ready
        if (!el.jfReady) return;
        // Ignore if ready doesn't include this id
        if (!el.jfReady.includes(id)) return;

        // Replace the ready array with one without this id
        el.jfReady = el.jfReady.filter((e) => e != id);

        // If we've got no more ready objects, then remove the jf-ready flag on this element
        if (el.jfReady.length == 0) {
          el.jfReady = undefined;
          el.removeAttribute("jf-ready");
        }
      });
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
    pause,
    destroy,
  };
};
