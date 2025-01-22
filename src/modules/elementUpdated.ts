import { useMutationObserver } from "./useMutationObserver";
import {
  validateSelectors,
  log as _log,
  isDebug,
  LogLevel,
  isFunction,
  isString,
  isObject,
  isStringArray,
} from "../helpers";

const VERSION: string = "1.0";

/**
 * Interface for elementUpdated return instance
 *
 * - `init` Start listening for the requested element to be removed again
 * - `destroy` Remove the listener completely
 */
export interface JfUpdated {
  /**
   * Start listening for the requested element to be removed again
   *
   * _Note: this function is only required if you want to re-listen once the elementUpdated listener is stopped or
   * destroyed. Running it whilst the listener is already bound will just error out due to the same id being used_
   *
   * @returns
   */
  init: () => void;
  /**
   * Completely remove this elementUpdated listener. Will stop listening for any future elements to be
   *
   * _Note: running `init` after `destroy` will restart the listener, and will treat all existing elements as **NOT**
   * found, so the callback will re-trigger for these elements_
   *
   * @returns
   */
  destroy: (delay?: number) => void;
}

/**
 * Represents a updated callback object that tracks elements in the DOM
 *
 * @property {string} id - Unique identifier for the callback
 * @property {Function} callback - Function to execute when element is updated
 */
export type JfUpdatedObject = {
  id: string;
  callback: (mutation: MutationRecord) => void;
};

/**
 * Description placeholder
 *
 * @property {boolean} attributes - Whether callback should be fired for attribute changes _(default: true)_
 * @property {boolean} characterData - Callback should be fired for characterData changes _(default: false)_
 * @property {string | string[]} attributeFilter - Optional filter for which attributes to fire changes on _(default:
 *   ["class"])
 */
export interface JfUpdatedOptions {
  attributes?: boolean;
  characterData?: boolean;
  textContent?: boolean;
  attributeFilter?: string | string[];
}

/**
 * Initializes the global jfLib object and its elementUpdated property Ensures the required object structure exists in
 * the window object
 */
const initializeJFLib = () => {
  window.jfLib = window.jfLib || {};
  window.jfLib.elementUpdated = window.jfLib.elementUpdated || {};
};

/**
 * Creates a new mutation observer instance for the current version Initializes the observer and callbacks array in the
 * global state
 */
const createObserver = () => {
  window.jfLib.elementUpdated[VERSION] = {
    observer: useMutationObserver(`elementUpdated-${VERSION}`),
    callbacks: [],
  };
};

/**
 * Retrieves the current version's elementUpdated observer instance
 *
 * @returns The observer instance and callbacks for the current version, or undefined if not initialized
 */
const getObserver = () => {
  return window.jfLib.elementUpdated?.[VERSION];
};

/**
 * Detects when an element matching a specific CSS selector is updated from the DOM and executes a callback.
 *
 * This function monitors the DOM for elements matching the given selector being removed. Once a matching element is
 * found and satisfies optional conditions, the callback function is executed.
 *
 * @example
 *   elementUpdated(
 *     ".some_class",
 *     (el) => {
 *       console.log("it's updated!");
 *       // do something
 *     },
 *     "some_unique_id",
 *     () => true // optional condition check
 *   );
 *
 * @param {string} selector - A CSS selector string used to identify the target element. _(required)_
 * @param {Function} callback - A function to execute when the element is removed. _(required)_
 * @param {string} id - A unique identifier to track elements that have already triggered the callback. _(required)_
 * @param {JfUpdatedOptions} options - Optional object to filter by specific updates _(defaults to only listen for class
 *   changes)_
 * @param {Function} [conditions] - Optional conditions to validate the element before triggering the callback. Must be
 *   a function that returns `true` for the callback to execute.
 * @returns
 *
 *   - `init` Function to re-init the listener once destroyed
 *   - `destroy` Function to completely remove this listener
 */
export const elementUpdated = (
  selector: string,
  callback: (el: Element) => void,
  id: string,
  options?: JfUpdatedOptions,
  conditions?: (el: Element) => boolean
): JfUpdated => {
  const log = (msg: string, lvl: LogLevel, debug: boolean = false, data?: unknown) => {
    if (!debug && isDebug()) return;
    _log(msg, lvl, `[${id}] elementUpdated`, data);
  };

  /**
   * Validates all input parameters for the elementUpdated function
   *
   * @returns {boolean} True if all validations pass
   * @throws {Error} If any validation fails with a descriptive message
   */
  const validateSetup = () => {
    // -- VALIDATE SELECTOR --
    if (!!!selector) {
      log("selector is not defined", "error");
      throw new Error("elementUpdated setup failed");
    }
    if (!isString(selector)) {
      log("selector must be a string", "error");
      throw new Error("elementUpdated setup failed");
    }
    if (!validateSelectors(selector)) {
      log("selector must be a valid css selector", "error");
      throw new Error("elementUpdated setup failed");
    }

    // -- VALIDATE CALLBACK --
    if (!!!callback) {
      log("callback is not defined", "error");
      throw new Error("elementUpdated setup failed");
    }
    if (!isFunction(callback)) {
      log("callback must be a function", "error");
      throw new Error("elementUpdated setup failed");
    }

    // -- VALIDATE ID --
    if (!!!id) {
      log("id is not defined", "error");
      throw new Error("elementUpdated setup failed");
    }
    if (!isString(id)) {
      log("id must be a string", "error");
      throw new Error("elementUpdated setup failed");
    }

    // -- VALIDATE OPTIONS --
    if (options) {
      if (!isObject(options)) {
        log("options must be an object", "error");
        throw new Error("elementUpdated setup failed");
      }
      if (!options.attributes && !options.characterData && !options.textContent) {
        log(
          "At least one of the following must be provided in options: attributes, characterData, textContent",
          "error"
        );
        throw new Error("elementUpdated setup failed");
      }
      if (options.attributeFilter) {
        if (!isString(options.attributeFilter) && !isStringArray(options.attributeFilter)) {
          log("attributeFilter must be a string, or array of strings", "error");
          throw new Error("elementUpdated setup failed");
        }
        if (isString(options.attributeFilter)) options.attributeFilter = [options.attributeFilter];
        if (options.attributeFilter.length == 0) {
          log("attributeFilter should not be empty", "error");
          throw new Error("elementUpdated setup failed");
        }
      }
    } else {
      // Set default
      options = { attributes: true, textContent: true, attributeFilter: ["class"] };
    }

    // -- VALIDATE CONDITIONS --
    if (conditions && !isFunction(conditions)) {
      log("conditions must be a function", "error");
      throw new Error("elementUpdated setup failed");
    }

    return true;
  };

  /**
   * Checks the element that was removed
   *
   * - Checks if extra conditions were provided, and if so, checks them against the target
   *
   * @param {Element} target - DOM element to check
   * @returns {boolean} True if conditions passed
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
   * Checks the element that was updated
   *
   * - Checks if the mutation type matches the options
   *
   * @param {MutationRecord} mutation - Mutation record to check
   * @returns {boolean} True if mutation matches options
   */
  const checkMutation = (mutation: MutationRecord) => {
    // Check the attributes
    if (mutation.type == "attributes") {
      if (!options.attributes) {
        log(`Ignored: attributes`, "warn", true);
        return false;
      }
      // If we have attributeFilter, check if this attribute is matched
      if (options.attributeFilter && !options.attributeFilter.includes(mutation.attributeName)) {
        log(`Ignored: ${mutation.attributeName} attribute`, "warn", true);
        return false;
      }

      log(`Updated: ${mutation.attributeName} attribute`, "info", true);
      return true;
    }

    // Check the characterData
    if (mutation.type == "characterData") {
      if (!options.characterData) {
        log(`Ignored: characterData`, "warn", true);
        return false;
      }
      log(`Updated: characterData`, "info", true);
      return true;
    }

    // Check for added text content
    if (
      mutation.type == "childList" &&
      mutation.addedNodes.length !== 0 &&
      !![...mutation.addedNodes].find((node) => node.nodeName == "#text")
    ) {
      if (!options.textContent) {
        log(`Ignored: textContent`, "warn", true);
      }
      log(`Updated: textContent`, "info", true);
      return true;
    }

    // Anything at this point isn't one of the above
    return false;
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

      // For this observer, we want to listen to EVERY change
      const config: MutationObserverInit = {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      };

      const mutationCallback: MutationCallback = (mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target.nodeType !== 1) return;
          // Grab all the callbacks from our callbacks array and run them each
          getObserver().callbacks.forEach((cb) => {
            if (typeof cb.callback == "function") cb.callback(mutation);
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
    const hasCallback = window.jfLib?.elementUpdated?.[VERSION]?.callbacks?.find((cb) => cb.id == id);
    if (hasCallback) {
      log("Function with this id is already bound", "error");
      return;
    }

    log("Listening", "success");
    log("Passed options", "info", true, options);

    // 2. Bind the elementUpdated observer to listen for any future changes
    bindObserver();

    // 3. Push our callback into the array
    getObserver()?.callbacks.push({
      id: id,
      callback: (mutation) => {
        const target = mutation.target as Element;

        // check whether this element matches the selector
        if (!target.matches(selector)) return;

        // validate if the conditions pass
        if (!checkConditions(target)) return;

        // validate if the mutation matches the options
        if (!checkMutation(mutation)) return;

        // then run our callback
        callback(target);
      },
    });
  };

  /**
   * Completely removes the elementUpdated functionality
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
