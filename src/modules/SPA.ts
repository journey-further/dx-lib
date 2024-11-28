import { insertStyle } from "./insertStyle";
import { JfObserver, useMutationObserver } from "./useMutationObserver";
import { waitForElement } from "./waitForElement";

declare global {
  interface Window {
    jfSPA: {
      tests: SPAState[];
      reapplyListener?: JfObserver;
      pageListener?: JfObserver;
      pagePath?: string;
    };
  }
}

/**
 * TODO:
 *
 * - Store main element selector so we can overwrite if needs be
 * - Store page change element so we can overwrite if needs be
 * - Change CSS selector match to just id/class matcher?
 * - Add debug flag? *
 */

/**
 * Type definition for the state of an SPA test
 *
 * @typedef {object} SPAState
 * @property {object} options - Test configuration options
 * @property {Function} options.applyFn - Function to execute when applying the test
 * @property {Function} [options.resetFn] - Optional function to execute when resetting
 * @property {string} [options.style] - Optional CSS styles
 * @property {boolean} [options.listenForPageChange] - Whether to listen for page changes
 * @property {string | string[]} [options.watchForRemoval] - Selector(s) to watch for removal
 * @property {string | string[]} [options.removeOnPageChange] - Selector(s) to remove on page change
 * @property {string | string[] | RegExp} options.pageMatch - Pattern(s) to match the current page
 * @property {number} loopCount - Number of times the test has been reapplied
 * @property {object} details - Test status details
 * @property {boolean} details.isRunning - Whether the test is currently running
 * @property {string} [details.id] - Test identifier
 */
export type SPAState = {
  options: {
    applyFn: () => void;
    resetFn?: () => void;
    style?: string;
    listenForPageChange?: boolean;
    watchForRemoval?: string | string[];
    removeOnPageChange?: string | string[];
    pageMatch: string | string[] | RegExp;
  };
  loopCount: number;
  details: {
    isRunning: boolean;
    id?: string;
  };
};

/**
 * Type definition for SPA test errors
 *
 * @typedef {object} SPAError
 * @property {"INVALID_ID" | "INVALID_OPTIONS" | "INVALID_SELECTOR" | "RUNTIME_ERROR"} code - Error code
 * @property {string} message - Error message
 * @property {unknown} [details] - Additional error details
 */
export type SPAError = {
  code: "INVALID_ID" | "INVALID_OPTIONS" | "INVALID_SELECTOR" | "RUNTIME_ERROR";
  message: string;
  details?: unknown;
};

const STATE: SPAState = {
  options: {
    applyFn: () => null,
    pageMatch: /.*?/g,
    listenForPageChange: true,
  },
  loopCount: 0,
  details: {
    isRunning: false,
    id: null,
  },
};

/**
 * Validates if a value is a regular expression
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is a RegExp instance
 */
const isRegExp = (value: unknown) => value instanceof RegExp;

/**
 * Validates if a value is an array containing only strings
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is an array of strings
 */
const isStringArray = (value: unknown) => Array.isArray(value) && value.every((item) => typeof item === "string");

/**
 * Validates if a value is a string
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is a string
 */
const isString = (value: unknown) => typeof value === "string";

/**
 * Validates if a value is a function
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is a function
 */
const isFunction = (value: unknown) => typeof value === "function";

/**
 * Removes the leading dot or hash from a CSS selector
 *
 * @param {string} selector - The CSS selector to process
 * @returns {string} The selector without the leading dot or hash
 */
const removeClassAndId = (selector: string) => selector.replace(/^(\.|#)/, "");

/**
 * Handles errors by logging them and disabling the init function
 *
 * @param {SPAError} error - The error object containing code, message and optional details
 */
const throwError = (error: SPAError) => {
  console.warn(`[SPA:${STATE.details.id}] ${error.code}: ${error.message}`, error.details);
  init = () => null;
};

/**
 * Validates the options passed to the SPA constructor
 *
 * @param {object} options - The options to validate
 * @param {Function} options.apply - The function to run when applying the test
 * @param {Function} [options.reset] - Optional function to run when resetting the test
 * @param {string} [options.style] - Optional CSS styles to apply
 * @param {string | string[] | RegExp} options.pageMatch - Pattern(s) to match the current page against
 * @param {string | string[]} [options.watchForRemoval] - Selector(s) to watch for removal
 * @param {string | string[]} [options.removeOnPageChange] - Selector(s) for elements to remove on page change
 * @returns {boolean} True if all options are valid
 */
const validateOptions = (options: {
  apply: () => void;
  reset?: () => void;
  style?: string;
  pageMatch: string | string[] | RegExp;
  watchForRemoval?: string | string[];
  removeOnPageChange?: string | string[];
}): boolean => {
  // Validate required
  if (!options.apply) {
    throwError({
      code: "INVALID_OPTIONS",
      message: "apply must be provided",
    });
    return false;
  }
  if (!options.pageMatch) {
    throwError({
      code: "INVALID_OPTIONS",
      message: "pageMatch must be provided",
    });
    return false;
  }

  // validate types
  if (!isFunction(options.apply)) {
    throwError({
      code: "INVALID_OPTIONS",
      message: "apply must be a function",
    });
    return false;
  }
  if (!(isRegExp(options.pageMatch) || isStringArray(options.pageMatch) || isString(options.pageMatch))) {
    throwError({
      code: "INVALID_OPTIONS",
      message: "pageMatch must be a string, an array of strings, or a RegExp",
    });
    return false;
  }
  if (options.reset && !isFunction(options.reset)) {
    throwError({
      code: "INVALID_SELECTOR",
      message: "reset must be a function",
    });
    return false;
  }
  if (options.watchForRemoval && !(isString(options.watchForRemoval) || isStringArray(options.watchForRemoval))) {
    throwError({
      code: "INVALID_SELECTOR",
      message: "watchForRemoval must be a string or array of strings",
    });
    return false;
  }
  if (
    options.removeOnPageChange &&
    !(isString(options.removeOnPageChange) || isStringArray(options.removeOnPageChange))
  ) {
    throwError({
      code: "INVALID_SELECTOR",
      message: "removeOnPageChange must be a string or array of strings",
    });
    return false;
  }

  // validate css strings
  if (options.watchForRemoval && !validateSelectors(options.watchForRemoval)) {
    throwError({
      code: "INVALID_SELECTOR",
      message: "watchForRemoval must be valid CSS selectors",
    });
    return false;
  }
  if (options.removeOnPageChange && !validateSelectors(options.removeOnPageChange)) {
    throwError({
      code: "INVALID_SELECTOR",
      message: "removeOnPageChange must be valid CSS selectors",
    });
    return false;
  }

  return true;
};

/**
 * Handles page change events by removing specified elements and reinitializing the test. If removeOnPageChange is set,
 * those elements will be removed before reinitializing.
 *
 * @returns {Promise<void>}
 * @throws {SPAError} If reinitialization fails
 */
const handlePageChange = async () => {
  try {
    log(`Page changed`, "info");
    if (!!STATE.options.removeOnPageChange) handleRemoveOnPageChange();
    await init();
  } catch (e) {
    throwError(e);
  }
};

/**
 * Removes elements specified in removeOnPageChange when a page change occurs. For each selector:
 *
 * - Removes matching elements from the DOM
 * - Removes matching IDs from elements
 * - Removes matching classes from elements
 */
const handleRemoveOnPageChange = () => {
  log(`Removing elements`, "info");
  const searchAndRemove = (selector: string) => {
    document.querySelectorAll(selector).forEach((el: Element) => {
      // remove class or id
      const parsedSelector = removeClassAndId(selector);
      // check for matching id and remove if found
      if (el.id && el.id == parsedSelector) el.removeAttribute("id");
      // check for matching class and remove if found
      if (el.classList.contains(parsedSelector)) el.classList.remove(parsedSelector);
      // remove the element
      el.remove();
    });
  };

  if (isString(STATE.options.removeOnPageChange)) {
    // it's a string, just search for it
    searchAndRemove(STATE.options.removeOnPageChange);
    return;
  }

  // otherwise it's an array, so loop and remove each
  STATE.options.removeOnPageChange.forEach((selector) => {
    searchAndRemove(selector);
  });
};

/**
 * Applies the test by:
 *
 * 1. Inserting any defined stylesheets
 * 2. Setting up removal watchers if specified
 * 3. Executing the user's apply function
 *
 * @throws {SPAError} If any step of the application process fails
 */
const applyTest = () => {
  try {
    log(`Applying Test`, "info");
    insertStyleSheet();
    bindWatchForRemoval();
    STATE.options.applyFn();
  } catch (e) {
    throwError(e);
  }
};

/**
 * Sets up mutation observers to watch for removal of specified elements. When watched elements are removed, the test
 * will be reapplied up to 5 times. After 5 reapplications, the test will be reset to prevent infinite loops.
 *
 * @throws {SPAError} If observer setup fails
 */
const bindWatchForRemoval = () => {
  try {
    if (!!!STATE.options.watchForRemoval) return;
    log(`Binding Removal Watcher`, "detail");

    // Create a new observer
    const observer = useMutationObserver(`_${STATE.details.id}_`);

    // Abort if already bound
    if (observer.details.isObserving) return;

    // Bind it
    const target = document.querySelector("body");

    const config: MutationObserverInit = { childList: true, subtree: true };

    const callback: MutationCallback = (mutations) => {
      mutations.forEach((mutation) => {
        try {
          if (mutation.removedNodes.length == 0) return;
          mutation.removedNodes.forEach(async (node) => {
            try {
              if (node.nodeType !== 1) return;

              // If we've already run this 5 times, don't proceed
              if (STATE.loopCount >= 6) return;

              // Define a function that checks if the element matches
              const checkElementMatches = async (string) => {
                try {
                  const match = removeClassAndId(string);
                  // Check if it's an id or not
                  const isId = /^#/.test(string);
                  let isMatched = false;
                  // If it's an id and the removed node matches

                  if (isId && (node as Element)?.id == match) isMatched = true;
                  // If it's a class and the removed node matches
                  if (!isId && (node as Element)?.classList.contains(match)) isMatched = true;
                  // If we have a match, re-init
                  if (isMatched) {
                    log(`Element was removed, re-init`, "warn");
                    if (STATE.loopCount >= 5) {
                      log(`Max loop count reached, aborting`, "error");
                      reset();
                      return;
                    }
                    STATE.loopCount += 1;
                    await init();
                  }
                } catch (e) {
                  throwError(e);
                }
              };

              // First check if it's an array or a string
              if (Array.isArray(STATE.options.watchForRemoval)) {
                STATE.options.watchForRemoval.forEach((string) => {
                  checkElementMatches(string);
                });
                return;
              }

              // Otherwise its a string, so just pass it
              checkElementMatches(STATE.options.watchForRemoval);
            } catch (e) {
              throwError(e);
            }
          });
        } catch (e) {
          throwError(e);
        }
      });
    };
    observer.observe(target, config, callback);
  } catch (e) {
    throwError(e);
  }
};

/**
 * Inserts the test's stylesheet into the document if one is defined The stylesheet is given a unique ID based on the
 * test ID
 */
const insertStyleSheet = () => {
  try {
    // Abort if we don't have a stylesheet
    if (!!!STATE.options.style) return;
    // Insert our stylesheet
    log(`Inserting Stylesheet`, "detail");
    insertStyle(STATE.options.style, `${STATE.details.id}--style`);
  } catch (e) {
    throwError(e);
  }
};

/** Removes the test's stylesheet from the document Finds and removes all elements matching the test's style ID */
const removeStyleSheet = () => {
  try {
    document.querySelectorAll(`#${STATE.details.id}--style`).forEach((el) => el.remove());
  } catch (e) {
    throwError(e);
  }
};

/**
 * Sets up a global mutation observer to watch for the main element being re-added to the page This handles cases where
 * the entire main content area is replaced in SPAs
 */
const bindMainRemovalListener = () => {
  // Abort if we've already added this listener as we only need one
  if (!!window.jfSPA.reapplyListener) return;
  try {
    const target = document.querySelector("html");
    if (!!!target) throw new Error("no target");

    const config: MutationObserverInit = { childList: true, subtree: true };

    const callback: MutationCallback = (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length === 0) return;
        mutation.addedNodes.forEach(async (node) => {
          try {
            // TODO: store the nodeName so that it can be overwritten if needs be
            if (node.nodeName !== "MAIN") return;
            // the MAIN element has been re-added, so re-init this test
            log(`Main element re-added, restarting test`, "warn");
            await init();
          } catch (e) {
            throwError(e);
          }
        });
      });
    };

    window.jfSPA.reapplyListener = useMutationObserver("ReapplyListener");
    window.jfSPA.reapplyListener.observe(target, config, callback);
  } catch (e) {
    throwError(e);
  }
};

/**
 * Sets up a global mutation observer to detect page changes in Single Page Applications.
 *
 * - Watches for changes to meta description or canonical link elements
 * - Tracks the current page path
 * - Dispatches a 'wt-pagechange' event when a navigation is detected
 * - Only creates one observer instance globally
 *
 * @throws {SPAError} If observer setup fails
 */
const bindPageChangeListener = () => {
  // Abort if we've already added this listener as we only need one
  if (!!window.jfSPA.pageListener) return;
  // console.log(`%cSetting Page Change Listener`, "info");
  try {
    // bind to html
    const target = document.querySelector("html");

    const config: MutationObserverInit = { childList: true, subtree: true };

    const callback: MutationCallback = () => {
      // TODO: store the linkElement so it can be overwritten if needs be
      const linkElement =
        document.querySelector('meta[name="description"]') || document.querySelector('link[rel="canonical"]');

      if (!!!linkElement || !!!window.jfSPA.pagePath || window.location.pathname === window.jfSPA.pagePath) return;

      // Update the current path
      window.jfSPA.pagePath = window.location.pathname;

      // Dispatch an event
      window.dispatchEvent(new Event("wt-pagechange"));
    };

    // Create the observer
    window.jfSPA.pageListener = useMutationObserver("PageListener");
    window.jfSPA.pageListener.observe(target, config, callback);

    // Set the current path initially
    window.jfSPA.pagePath = window.location.pathname || "";
  } catch (e) {
    throwError(e);
  }
};

/**
 * Validates if a CSS selector string is syntactically valid by attempting to use it in a querySelector call on a
 * DocumentFragment.
 *
 * @param {string} selector - The CSS selector to validate
 * @returns {boolean} True if the selector can be used in querySelector
 */
const isSelectorValid = (selector: string): boolean => {
  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates an array of CSS selectors or a single selector
 *
 * @param {string | string[]} selectors - The selector(s) to validate
 * @returns {boolean} True if all selectors are valid
 */
const validateSelectors = (selectors: string | string[]): boolean => {
  const toValidate = Array.isArray(selectors) ? selectors : [selectors];
  return toValidate.every(isSelectorValid);
};

type LogLevel = "info" | "detail" | "success" | "warn" | "error";

/**
 * Logs messages to the console with consistent formatting and color coding. Different log levels are color-coded for
 * better visibility:
 *
 * - Info: blue
 * - Detail: purple
 * - Success: green
 * - Warn: orange
 * - Error: red
 *
 * @param {string} message - The message to log
 * @param {LogLevel} level - The log level (info, detail, success, warn, error)
 * @param {unknown} [data] - Optional data to log alongside the message
 */
const log = (message: string, level: LogLevel = "info", data?: unknown) => {
  const styles = {
    info: "background: #61afef; color: #fff; padding: 2px 5px;",
    detail: "background: #c162de; color: #fff; padding: 2px 5px;",
    success: "background: #8cc265; color: #fff; padding: 2px 5px;",
    warn: "background: #f0a45d; color: #fff; padding: 2px 5px;",
    error: "background: #ff616e; color: #fff; padding: 2px 5px;",
  };

  if (!!data) {
    console.log(`%c[${STATE.details.id}] ${message}`, styles[level], data);
  } else {
    console.log(`%c[${STATE.details.id}] ${message}`, styles[level]);
  }
};

/**
 * Initializes the test by checking page matches and applying the test
 *
 * - Validates if current page matches the test criteria
 * - Waits for body element to exist
 * - Applies the test if conditions are met
 *
 * @returns {Promise<void>}
 */
let init = async () => {
  try {
    // If we have pageMatch, then check that first before we run anything
    if (!!STATE.options.pageMatch) {
      const pageNotMatched = () => {
        // Not the right page
        log("Page not matched", "error");
        // Reset the test
        reset();
      };

      // Check if it's regex
      if (isRegExp(STATE.options.pageMatch)) {
        // It's regex
        const regex = new RegExp(STATE.options.pageMatch, "gi");
        if (!regex.test(window.location.pathname)) {
          pageNotMatched();
          return;
        }
      }

      // Check if it's an array of strings
      if (isStringArray(STATE.options.pageMatch)) {
        // It's an array, so loop it and check each one
        let matched = false;
        for (let i = 0; i < STATE.options.pageMatch.length; i++) {
          // if this page matches, update the value to true
          if (window.location.pathname == STATE.options.pageMatch[i]) matched = true;
        }

        // if none of the pages matched, quit out
        if (!!!matched) {
          pageNotMatched();
          return;
        }
      }

      // Check if it's a string
      if (isString(STATE.options.pageMatch)) {
        // It's a string, so check if pathname matches
        if (window.location.pathname !== STATE.options.pageMatch) {
          pageNotMatched();
          return;
        }
      }
    }

    log(`Page matched!`, "success");

    // Wait for the body to exist to avoid issues
    await waitForElement("body");
    applyTest();
  } catch (e) {
    throwError(e);
  }
};

/**
 * Resets the test by removing styles and executing the reset function
 *
 * - Removes any inserted stylesheets
 * - Calls the user-defined reset function if provided
 */
const reset = () => {
  log(`Resetting Test`, "info");
  // Remove the inserted stylesheet
  removeStyleSheet();
  // Run the reset function
  if (isFunction(STATE.options.resetFn)) STATE.options.resetFn();
};

/**
 * Completely removes the test from the page and global state
 *
 * - Marks the test as not running
 * - Removes it from the global test registry
 */
const disconnect = () => {
  // wipe the test
  STATE.details.isRunning = false;
  // delete it from our records
  window.jfSPA.tests = window.jfSPA.tests.filter((test) => test.details.id !== STATE.details.id);
};

/**
 * Creates a new SPA test instance for implementing A/B tests on Single Page Applications.
 *
 * The SPA function provides a structured way to implement tests with features such as:
 *
 * - Applying test-specific styles and functions
 * - Watching for element removal and reapplying the test automatically
 * - Handling page changes in Single Page Applications (SPAs)
 * - Cleaning up resources to prevent memory leaks or unintended side effects
 *
 * The function integrates with globally scoped listeners and observers to manage tests effectively, even in dynamic
 * environments.
 *
 * @param {string} id - Unique identifier for the test
 * @param {object} options - Configuration options for the test setup
 * @param {Function} options.apply - Function to execute when applying the test. _(Required)_
 * @param {Function} [options.reset] - Optional function to execute when resetting the test
 * @param {string} [options.style] - Optional CSS styles to apply during the test
 * @param {string | string[] | RegExp} options.pageMatch - Pattern(s) to match the current page against. _(Required)_
 *   Can be a string for exact match, array of strings for multiple matches, or RegExp for pattern matching
 * @param {string | string[]} [options.watchForRemoval] - Selector(s) to watch for removal and trigger reapplication
 * @param {string | string[]} [options.removeOnPageChange] - Selector(s) for elements to remove when page changes
 *
 *   Key Features:
 *
 *   - Automatically applies the test when initialized and ensures it only runs once
 *   - Validates the test setup, including required parameters like `apply` and `pageMatch`
 *   - Watches for specific DOM element removal and re-applies the test if necessary
 *   - Listens for page changes in SPAs and ensures the test is applied or reset as needed
 *   - Integrates with mutation observers for reliable DOM monitoring
 *   - Provides cleanup methods to prevent memory leaks
 *
 *   Usage:
 *
 *   ```javascript
 *   const test = SPA("TestID", {
 *     apply: () => {
 *       console.log("Test applied");
 *     },
 *     reset: () => {
 *       console.log("Test reset");
 *     },
 *     style: ".my-test { color: red; }",
 *     pageMatch: "/test-page", // or ["/page1", "/page2"] or /\/test-./
 *     watchForRemoval: "#test-element",
 *     removeOnPageChange: [".test-class", "#test-id"],
 *   });
 *
 *   test.init(); // Start the test
 *   test.reset(); // Reset the test
 *   test.disconnect(); // Remove the test completely
 *   ```
 */
export const SPA = (
  id: string,
  options: {
    apply: () => void;
    reset?: () => void;
    style?: string;
    pageMatch: string | string[] | RegExp;
    watchForRemoval?: string | string[];
    removeOnPageChange?: string | string[];
  }
) => {
  try {
    // Check an id has been provided
    if (!!!id) throw new Error("You must provide a Test ID");
    STATE.details.id = id;

    log(`Create Test`, "info");

    // Check if this test is already setup
    window.jfSPA = window.jfSPA || { tests: [] };
    STATE.details.isRunning = !!window.jfSPA.tests.find((test) => test.details.id == id);
    if (STATE.details.isRunning) {
      log(`Test already setup`, "warn");
      // change our init function so it does nothing as this version of the test doesn't need to run
      init = () => null;
      return;
    }

    const hasValidOptions = validateOptions(options);
    if (!hasValidOptions) return;

    // Add required options
    STATE.options.applyFn = options.apply;
    STATE.options.pageMatch = options.pageMatch;

    // Add reset function
    if (!!options.reset) STATE.options.resetFn = options.reset;

    // Add style sheet
    if (!!options.style) STATE.options.style = options.style;

    // Define whether we should watch for removal of an element to re-init
    if (!!options.watchForRemoval) STATE.options.watchForRemoval = options.watchForRemoval;

    // Define whether to remove specific elements on page change
    if (!!options.removeOnPageChange) STATE.options.removeOnPageChange = options.removeOnPageChange;

    // Add our page change listener
    bindPageChangeListener();

    // Add our main element removal listener
    bindMainRemovalListener();

    // Bind an event to handle the page change
    log(`Binding Page Change`, "detail");
    window.removeEventListener("wt-pagechange", handlePageChange);
    window.addEventListener("wt-pagechange", handlePageChange);

    // Push this test to global object and mark it as running
    STATE.details.isRunning = true;
    window.jfSPA.tests.push(STATE);
  } catch (e) {
    throwError(e);
  }
};

/**
 * Initializes the test by checking page matches and applying the test
 *
 * - Validates if current page matches the test criteria
 * - Waits for body element to exist
 * - Applies the test if conditions are met
 *
 * @returns {Promise<void>}
 */
SPA.prototype.init = init;

/**
 * Resets the test by removing styles and executing the reset function
 *
 * - Removes any inserted stylesheets
 * - Calls the user-defined reset function if provided
 */
SPA.prototype.reset = reset;

/**
 * Completely removes the test from the page and global state
 *
 * - Marks the test as not running
 * - Removes it from the global test registry
 */
SPA.prototype.disconnect = disconnect;

/**
 * Provides access to the current state and status of the SPA test instance. This property allows you to check the
 * test's running status and identifier at any time.
 *
 * @example
 *   ```javascript
 *   const test = SPA("my-test", {...});
 *
 *   // Check if the test is running
 *   if (test.details.isRunning) {
 *   console.log(`Test ${test.details.id} is active`);
 *   }
 *   ```
 *
 * @type {{ isRunning: boolean; id: string }}
 * @property {boolean} isRunning - Indicates whether the test is currently active and running on the page
 * @property {string} id - The unique identifier that was used to initialize this test
 * @readonly
 */
SPA.prototype.details = STATE.details;
