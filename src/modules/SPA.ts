import { insertStyle } from "./insertStyle";
import { useMutationObserver } from "./useMutationObserver";
import { waitForElement } from "./waitForElement";

/**
 * Type guard to check if an unknown value is a JfSPA instance
 *
 * @param {unknown} toCheck - Value to check
 * @returns {boolean} True if value is a JfSPA instance
 */
export const isSPAType = (toCheck: unknown): toCheck is JfSPA => toCheck instanceof Object && "details" in toCheck;

/**
 * Details about the current state of a SPA test
 *
 * @property {boolean} isRunning - Whether the test is currently running
 * @property {string} id - Unique identifier for the test
 * @interface JfSPADetails
 */
export interface JfSPADetails {
  /** Whether the test is currently running */
  isRunning: boolean;
  /** Unique identifier for the test */
  id: string;
}

/**
 * Main interface for a SPA test instance
 *
 * @property {JfSPADetails} details Provides details of the running test
 * @property {() => void} disconnect Completely removes the test and cleans up any registered listeners
 * @property {() => void} reset Resets the test by removing styles and executing the reset function if provided
 * @property {(options: JfSPAOptions) => void} init Start the test using the options provided
 */
export interface JfSPA {
  /**
   * Provides details of the running test
   *
   * @param {string} id Unique identifier for the test
   * @param {boolean} isRunning Whether the test is currently running
   */
  details: JfSPADetails;
  /**
   * Completely removes the test and cleans up any registered listeners
   *
   * @example
   *   Test.disconnect();
   */
  disconnect: () => void;
  /**
   * Resets the test by removing styles and executing the reset function if provided
   *
   * @example
   *   Test.reset();
   */
  reset: () => void;
  /**
   * Start the test using the options provided
   *
   * @example
   *   Test.init({
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
   * @param {object} options - Configuration options for the test setup
   * @param {Function} options.apply - Function to execute when applying the test. _(Required)_
   * @param {Function} [options.reset] - Function to execute when resetting the test
   * @param {string} [options.style] - CSS styles to apply during the test
   * @param {string | string[] | RegExp} options.pageMatch - Pattern(s) to match the current page against. _(Required)_
   *   Can be a string for exact match, array of strings for multiple matches, or RegExp for pattern matching
   * @param {string | string[]} [options.watchForRemoval] - Selector(s) to watch for removal and trigger reapplication
   * @param {string | string[]} [options.removeOnPageChange] - Selector(s) for elements to remove when page changes
   * @param {string | string[]} [options.removedNode] - Name of node to watch for being removed on SPA reset
   */
  init: (options: JfSPAOptions) => unknown;
}

/**
 * Internal state management for SPA tests
 *
 * @property {JfSPAOptions} options - Configuration options for the test
 * @property {number} loopCount - Number of times the test has been reapplied
 * @property {JfSPADetails} details - Current state details of the test
 * @interface JfSPAState
 */
export interface JfSPAState {
  options: JfSPAOptions;
  loopCount: number;
  details: JfSPADetails;
}

/**
 * Type definition for SPA test errors
 *
 * @typedef {object} JfSPAError
 * @property {"INVALID_ID" | "INVALID_OPTIONS" | "INVALID_SELECTOR" | "RUNTIME_ERROR"} code - Error code
 * @property {string} message - Error message
 * @property {unknown} [details] - Additional error details
 */
export type JfSPAError = {
  code: "INVALID_ID" | "MISSING_OPTION" | "INVALID_TYPE" | "INVALID_SELECTOR" | "RUNTIME_ERROR";
  message: string;
  details?: unknown;
};

/**
 * Log level types for internal logging
 *
 * @typedef {"info" | "detail" | "success" | "warn" | "error"} SPALogLevel
 */
export type SPALogLevel = "info" | "detail" | "success" | "warn" | "error";

/**
 * Configuration options for SPA test initialization
 *
 * @property {() => void} apply - Function to execute when applying the test
 * @property {() => void} [reset] - Optional function to execute when resetting the test
 * @property {string} [style] - Optional CSS styles to apply
 * @property {string | string[] | RegExp} pageMatch - Pattern(s) to match the current page URL
 * @property {string | string[]} [watchForRemoval] - Selector(s) to watch for removal
 * @property {string | string[]} [removeOnPageChange] - Selector(s) for elements to remove on page change
 * @property {string} [removedNode] - Name of node to watch for removal
 * @interface JfSPAOptions
 */
export interface JfSPAOptions {
  /** Function to execute when applying the test. _(Required)_ */
  apply: () => unknown;
  /** Function to execute when resetting the test */
  reset?: () => unknown;
  /** CSS styles to apply during the test. Will apply only once, using the test's `id` as a unique identifier */
  style?: string;
  /**
   * Pattern(s) to match the current page against. _(Required)_
   *
   * @example
   *   // match pages with a regex string
   *   pageMatch: /product/;
   *   // match a page with a string (string == window.location.pathname)
   *   pageMatch: "/";
   *   // match multiple pages (same as above)
   *   pageMatch: ["/", "/home"];
   */
  pageMatch: string | string[] | RegExp;
  /**
   * Selector(s) to watch for removal and trigger reapplication. Useful when an SPA detects incorrect content in the DOM
   * and removes it
   *
   * Has built in protection for an element being constantly removed and re-inserted - will only run `5` times
   *
   * @example
   *   // When any element matching this selector is removed, restart the test
   *   watchForRemoval: ".some--class";
   *   // When any of the following elements match, restart the test
   *   watchForRemoval: [".some--class", ".some--other-class"];
   */
  watchForRemoval?: string | string[];
  /**
   * Selector(s) for elements to remove when page changes. Used to help un-do any content being added into the DOM
   *
   * @example
   *   // When any element matching this selector is removed, restart the test
   *   removeOnPageChange: ".some--class";
   *   // When any of the following elements match, restart the test
   *   removeOnPageChange: [".some--class", ".some--other-class"];
   */
  removeOnPageChange?: string | string[];
  /**
   * Name of node to watch for to detect a full SPA reset. Defaults to `MAIN`.
   *
   * Only required if this SPA does not have a `<main>` element
   */
  removedNode?: string;
}

/**
 * Creates a new SPA test instance for implementing A/B tests on Single Page Applications.
 *
 * Function provides a structured way to implement tests with the following features:
 *
 * - Automatically applies the test when initialized and ensures it only runs once
 * - Validates the test setup, including required parameters like `apply` and `pageMatch`
 * - Watches for specific DOM element removal and re-applies the test if necessary
 * - Listens for page changes in SPAs and ensures the test is applied or reset as needed
 * - Integrates with mutation observers for reliable DOM monitoring
 * - Provides cleanup methods to prevent memory leaks
 *
 * The returned object provides methods to:
 *
 * - Start running a test (`init`)
 * - Reset a test (`reset`)
 * - Completely remove a test (`disconnect`)
 *
 * @example
 *   const STATE = {
 *     Test: useSPA("TestID"),
 *   };
 *
 *   // Start the test
 *   Test.init({
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
 *   // Reset the test
 *   Test.reset();
 *
 *   // Remove the test completely
 *   Test.disconnect();
 *
 * @param {string} id Unique identifier for the test - will prevent the test from being run multiple times
 */
export const useSPA = (id: string): JfSPA => {
  // Setup initial state
  const STATE: JfSPAState = {
    options: {
      apply: () => null,
      pageMatch: /.*?/g,
      removedNode: "MAIN",
    },
    loopCount: 0,
    details: {
      isRunning: false,
      id: null,
    },
  };
  /**
   * Sets up the SPA test with provided options
   *
   * @param {JfSPAOptions} options - Configuration options for the test
   * @throws {Error} If setup fails or invalid options provided
   */
  const setupTest = (options: JfSPAOptions) => {
    try {
      // Check an id has been provided
      if (!!!id) throw new Error("You must provide a Test ID");
      STATE.details.id = id;

      // Check if this test is already setup
      window.jfTests = window.jfTests || { tests: [] };
      STATE.details.isRunning = !!window.jfTests.tests.find(
        (test) => isSPAType(test) && test.details && test.details.id == id
      );
      if (STATE.details.isRunning) {
        log(`Test already setup`, "warn");
        // initTest = () => null;
        return false;
      }

      log(`Creating Test`, "info");

      const hasValidOptions = validateOptions(options);
      if (!hasValidOptions) {
        return false;
      }

      // Add required options
      STATE.options.apply = options.apply;
      STATE.options.pageMatch = options.pageMatch;

      // Add reset function
      if (!!options.reset) STATE.options.reset = options.reset;

      // Add style sheet
      if (!!options.style) STATE.options.style = options.style;

      // Define whether we should watch for removal of an element to re-init
      if (!!options.watchForRemoval) STATE.options.watchForRemoval = options.watchForRemoval;

      // Define whether to remove specific elements on page change
      if (!!options.removeOnPageChange) STATE.options.removeOnPageChange = options.removeOnPageChange;

      // Overwrite the nodeName used to detect if SPA has been wiped
      if (!!options.removedNode) STATE.options.removedNode = options.removedNode.toUpperCase();

      // Add our page change listener
      bindPageChangeListener();

      // Add our main element removal listener
      bindMainRemovalListener();

      // Bind an event to handle the page change
      log(`+ Binding Page Change`, "detail");
      window.removeEventListener("wt-pagechange", handlePageChange);
      window.addEventListener("wt-pagechange", handlePageChange);

      // Push this test to global object and mark it as running
      STATE.details.isRunning = true;
      window.jfTests.tests.push(this);
      return true;
    } catch (e) {
      throwError(e);
      return false;
    }
  };

  /**
   * Checks if a value is a regular expression
   *
   * @param {unknown} value - The value to check
   * @returns {boolean} True if the value is a RegExp instance
   */
  const isRegExp = (value: unknown) => value instanceof RegExp;

  /**
   * Checks if a value is an array containing only strings
   *
   * @param {unknown} value - The value to check
   * @returns {boolean} True if the value is an array where every item is a string
   */
  const isStringArray = (value: unknown) => Array.isArray(value) && value.every((item) => typeof item === "string");

  /**
   * Checks if a value is a string
   *
   * @param {unknown} value - The value to check
   * @returns {boolean} True if the value is a string
   */
  const isString = (value: unknown) => typeof value === "string";

  /**
   * Checks if a value is a function
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
   * Sets up a mutation observer to watch for the main element being re-added to the page. This handles cases where the
   * entire main content area is replaced in SPAs. Only one observer is created globally and shared across all test
   * instances.
   *
   * @throws {Error} If the HTML element cannot be found
   */
  const bindMainRemovalListener = () => {
    // Abort if we've already added this listener as we only need one
    if (!!window.jfTests.reapplyListener) return;
    try {
      const target = document.querySelector("html");
      if (!!!target) throw new Error("no target");

      const config: MutationObserverInit = { childList: true, subtree: true };

      const callback: MutationCallback = (mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length === 0) return;
          mutation.addedNodes.forEach(async (node) => {
            try {
              if (node.nodeName !== STATE.options.removedNode) return;
              // the MAIN element has been re-added, so re-init this test
              log(`Main element re-added, restarting test`, "warn");
              await initTest();
            } catch (e) {
              throwError(e);
            }
          });
        });
      };

      window.jfTests.reapplyListener = useMutationObserver("ReapplyListener");
      window.jfTests.reapplyListener.observe(target, config, callback);
    } catch (e) {
      throwError(e);
    }
  };

  /**
   * Sets up a mutation observer to detect page changes in Single Page Applications. Watches for changes to meta
   * description or canonical link elements. Only one observer is created globally and shared across all test
   * instances.
   *
   * @throws {Error} If observer setup fails
   */
  const bindPageChangeListener = () => {
    // Abort if we've already added this listener as we only need one
    if (!!window.jfTests.pageListener) return;
    try {
      // bind to html
      const target = document.querySelector("html");

      const config: MutationObserverInit = { childList: true, subtree: true };

      const callback: MutationCallback = () => {
        const linkElement =
          document.querySelector('meta[name="description"]') || document.querySelector('link[rel="canonical"]');

        if (!!!linkElement || !!!window.jfTests.pagePath || window.location.pathname === window.jfTests.pagePath)
          return;

        // Update the current path
        window.jfTests.pagePath = window.location.pathname;

        // Dispatch an event
        window.dispatchEvent(new Event("wt-pagechange"));
      };

      // Create the observer
      window.jfTests.pageListener = useMutationObserver("PageListener");
      window.jfTests.pageListener.observe(target, config, callback);

      // Set the current path initially
      window.jfTests.pagePath = window.location.pathname || "";
    } catch (e) {
      throwError(e);
    }
  };

  /**
   * Initializes the test if the current page matches the configured patterns
   *
   * @returns {Promise<void>}
   * @throws {Error} If initialization fails
   */
  let initTest = async (): Promise<void> => {
    try {
      // If we have pageMatch, then check that first before we run anything
      if (!!STATE.options.pageMatch) {
        const pageNotMatched = () => {
          // Not the right page
          log("Page not matched", "error");
          // Reset the test
          resetTest();
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
   * Resets the test by removing styles and executing the reset function if provided
   *
   * @returns {void}
   */
  const resetTest = (): void => {
    log(`Resetting Test`, "info");
    // Remove the inserted stylesheet
    removeStyleSheet();
    // Run the reset function
    if (isFunction(STATE.options.reset)) STATE.options.reset();
  };

  /**
   * Completely removes the test and cleans up any registered listeners
   *
   * @returns {void}
   */
  const removeTest = (): void => {
    // wipe the test
    STATE.details.isRunning = false;
    // delete it from our records
    window.jfTests.tests = window.jfTests.tests.filter(
      (test) => isSPAType(test) && test.details.id !== STATE.details.id
    );
  };

  /**
   * Handles errors by formatting them and throwing with a consistent structure
   *
   * @param {JfSPAError | Error} error - The error to process
   * @throws {Error} A formatted error with test ID and details
   */
  const throwError = (error: JfSPAError | Error) => {
    const errorObj =
      error instanceof Error
        ? {
            code: "RUNTIME_ERROR" as const,
            message: error.message,
            details: error,
          }
        : error;

    // If it's already a formatted error, throw as-is
    if (error.message.includes(`[${STATE.details.id}]`)) {
      throw error;
    }
    // Otherwise, format the error
    throw new Error(`[${STATE.details.id}] ${errorObj.code}: ${errorObj.message}`, errorObj.details);
  };

  /**
   * Logs messages to the console with consistent formatting and color coding
   *
   * @param {string} message - The message to log
   * @param {SPALogLevel} level - The log level (info, detail, success, warn, error)
   * @param {unknown} [data] - Optional data to log alongside the message
   */
  const log = (message: string, level: SPALogLevel = "info", data?: unknown) => {
    const styles = {
      info: "background: #61afef; color: #fff; padding: 2px 5px;",
      detail: "background: #c162de; color: #fff; padding: 2px 5px;",
      success: "background: #8cc265; color: #fff; padding: 2px 5px;",
      warn: "background: #f0a45d; color: #fff; padding: 2px 5px;",
      error: "background: #ff616e; color: #fff; padding: 2px 5px;",
    };

    if (!!data) {
      console.log(`${STATE.details.id} %c${message}`, styles[level], data);
    } else {
      console.log(`${STATE.details.id} %c${message}`, styles[level]);
    }
  };

  /**
   * Validates the options passed to the constructor Checks for required options and validates types and CSS selectors
   *
   * @param {object} options - The options to validate
   * @returns {boolean} True if all options are valid
   * @throws {JfSPAError} If any validation fails
   */
  const validateOptions = (options: JfSPAOptions): boolean => {
    // Validate required
    if (!options.apply) {
      throwError({
        code: "MISSING_OPTION",
        message: "apply must be provided",
      });
      return false;
    }
    if (!options.pageMatch) {
      throwError({
        code: "MISSING_OPTION",
        message: "pageMatch must be provided",
      });
      return false;
    }

    // validate types
    if (!isFunction(options.apply)) {
      throwError({
        code: "INVALID_TYPE",
        message: "apply must be a function",
      });
      return false;
    }
    if (!(isRegExp(options.pageMatch) || isStringArray(options.pageMatch) || isString(options.pageMatch))) {
      throwError({
        code: "INVALID_TYPE",
        message: "pageMatch must be a string, an array of strings, or a RegExp",
      });
      return false;
    }
    if (options.reset && !isFunction(options.reset)) {
      throwError({
        code: "INVALID_TYPE",
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
   * Validates if a CSS selector string is syntactically valid Tests the selector by attempting to use it in a
   * querySelector call
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
    return toValidate.every(isSelectorValid.bind(this));
  };

  /**
   * Handles page change events in SPAs by removing specified elements and reinitializing
   *
   * @returns {Promise<void>}
   * @throws {Error} If page change handling fails
   */
  const handlePageChange = async () => {
    try {
      log(`Page changed`, "info");
      if (!!STATE.options.removeOnPageChange) handleRemoveOnPageChange();
      await initTest();
    } catch (e) {
      throwError(e);
    }
  };

  /**
   * Removes elements specified in removeOnPageChange when a page change occurs For each selector:
   *
   * - Removes matching elements from the DOM
   * - Removes matching IDs from elements
   * - Removes matching classes from elements
   *
   * @returns {void}
   */
  const handleRemoveOnPageChange = () => {
    log(`- Removing elements`, "detail");
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
      searchAndRemove(STATE.options.removeOnPageChange as string);
      return;
    }

    // otherwise it's an array, so loop and remove each
    (STATE.options.removeOnPageChange as string[]).forEach((selector) => {
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
   * @throws {Error} If any step of the application process fails
   */
  const applyTest = () => {
    try {
      log(`Applying Test`, "info");
      insertStyleSheet();
      bindWatchForRemoval();
      STATE.options.apply();
    } catch (e) {
      throwError(e);
    }
  };

  /**
   * Sets up mutation observers to watch for removal of specified elements When watched elements are removed, the test
   * will be reapplied up to 5 times After 5 reapplications, the test will be reset to prevent infinite loops
   *
   * @throws {Error} If observer setup fails
   */
  const bindWatchForRemoval = () => {
    try {
      if (!!!STATE.options.watchForRemoval) return;
      log(`+ Binding Removal Watcher`, "detail");

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
                const checkElementMatches = async (string: string) => {
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
                        resetTest();
                        return;
                      }
                      STATE.loopCount += 1;
                      await initTest();
                    }
                  } catch (e) {
                    throwError(e);
                  }
                };

                // First check if it's an array or a string
                if (Array.isArray(STATE.options.watchForRemoval)) {
                  (STATE.options.watchForRemoval as string[]).forEach((string) => {
                    checkElementMatches(string);
                  });
                  return;
                }

                // Otherwise its a string, so just pass it
                checkElementMatches(STATE.options.watchForRemoval as string);
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
   *
   * @throws {Error} If stylesheet insertion fails
   */
  const insertStyleSheet = () => {
    try {
      // Abort if we don't have a stylesheet
      if (!!!STATE.options.style) return;
      // Insert our stylesheet
      log(`+ Inserting Stylesheet`, "detail");
      insertStyle(STATE.options.style, `${STATE.details.id}--style`);
    } catch (e) {
      throwError(e);
    }
  };

  /**
   * Removes the test's stylesheet from the document Finds and removes all elements matching the test's style ID
   *
   * @throws {Error} If stylesheet removal fails
   */
  const removeStyleSheet = () => {
    try {
      document.querySelectorAll(`#${STATE.details.id}--style`).forEach((el) => el.remove());
    } catch (e) {
      throwError(e);
    }
  };

  // Return our functions to call
  return {
    details: STATE.details,
    init: (options: JfSPAOptions) => {
      try {
        // set up the test
        const isSetup = setupTest(options);
        if (!!!isSetup) return;
        // run the init function
        initTest();
      } catch (error) {
        throwError(error);
      }
    },
    reset: resetTest,
    disconnect: removeTest,
  };
};
