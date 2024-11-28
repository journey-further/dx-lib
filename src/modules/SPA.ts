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
 * @property {string} options.removedNode - Name of node to watch for being removed on SPA reset
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
    removedNode?: string;
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
  code: "INVALID_ID" | "MISSING_OPTION" | "INVALID_TYPE" | "INVALID_SELECTOR" | "RUNTIME_ERROR";
  message: string;
  details?: unknown;
};

export type LogLevel = "info" | "detail" | "success" | "warn" | "error";

/**
 * Creates a new SPA test instance for implementing A/B tests on Single Page Applications.
 *
 * The SPA class provides a structured way to implement tests with features such as:
 *
 * - Applying test-specific styles and functions
 * - Watching for element removal and reapplying the test automatically
 * - Handling page changes in Single Page Applications (SPAs)
 * - Cleaning up resources to prevent memory leaks or unintended side effects
 *
 * The class integrates with globally scoped listeners and observers to manage tests effectively, even in dynamic
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
 * @param {string | string[]} [options.removedNode] - Name of node to watch for being removed on SPA reset
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
 *   const test = new SPA("TestID", {
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
export class SPA {
  private state: SPAState = {
    options: {
      applyFn: () => null,
      pageMatch: /.*?/g,
      listenForPageChange: true,
      removedNode: "MAIN",
    },
    loopCount: 0,
    details: {
      isRunning: false,
      id: null,
    },
  };

  /**
   * Provides access to the current state and status of the SPA test instance. This property allows you to check the
   * test's running status and identifier at any time.
   *
   * @type {{ isRunning: boolean; id: string }}
   * @readonly
   */
  public get details(): { isRunning: boolean; id: string } {
    return this.state.details as { isRunning: boolean; id: string };
  }

  /**
   * Creates a new SPA test instance for implementing A/B tests on Single Page Applications.
   *
   * The SPA class provides a structured way to implement tests with features such as:
   *
   * - Applying test-specific styles and functions
   * - Watching for element removal and reapplying the test automatically
   * - Handling page changes in Single Page Applications (SPAs)
   * - Cleaning up resources to prevent memory leaks or unintended side effects
   *
   * The class integrates with globally scoped listeners and observers to manage tests effectively, even in dynamic
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
   * @param {string | string[]} [options.removedNode] - Name of node to watch for being removed on SPA reset
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
   *   const test = new SPA("TestID", {
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
  constructor(
    id: string,
    options: {
      apply: () => void;
      reset?: () => void;
      style?: string;
      pageMatch: string | string[] | RegExp;
      watchForRemoval?: string | string[];
      removeOnPageChange?: string | string[];
      removedNode?: string;
    }
  ) {
    try {
      // Check an id has been provided
      if (!!!id) throw new Error("You must provide a Test ID");
      this.state.details.id = id;

      // Check if this test is already setup
      window.jfSPA = window.jfSPA || { tests: [] };
      this.state.details.isRunning = !!window.jfSPA.tests.find((test) => test.details.id == id);
      if (this.state.details.isRunning) {
        this.log(`Test already setup`, "warn");
        this.init = () => null;
        return;
      }

      this.log(`Creating Test`, "info");

      const hasValidOptions = this.validateOptions(options);
      if (!hasValidOptions) {
        return;
      }

      // Add required options
      this.state.options.applyFn = options.apply;
      this.state.options.pageMatch = options.pageMatch;

      // Add reset function
      if (!!options.reset) this.state.options.resetFn = options.reset;

      // Add style sheet
      if (!!options.style) this.state.options.style = options.style;

      // Define whether we should watch for removal of an element to re-init
      if (!!options.watchForRemoval) this.state.options.watchForRemoval = options.watchForRemoval;

      // Define whether to remove specific elements on page change
      if (!!options.removeOnPageChange) this.state.options.removeOnPageChange = options.removeOnPageChange;

      // Overwrite the nodeName used to detect if SPA has been wiped
      if (!!options.removedNode) this.state.options.removedNode = options.removedNode.toUpperCase();

      // Add our page change listener
      this.bindPageChangeListener();

      // Add our main element removal listener
      this.bindMainRemovalListener();

      // Bind an event to handle the page change
      this.log(`+ Binding Page Change`, "detail");
      window.removeEventListener("wt-pagechange", this.handlePageChange);
      window.addEventListener("wt-pagechange", this.handlePageChange);

      // Push this test to global object and mark it as running
      this.state.details.isRunning = true;
      window.jfSPA.tests.push(this.state);
    } catch (e) {
      this.throwError(e);
    }
  }

  /**
   * Checks if a value is a regular expression
   *
   * @param {unknown} value - The value to check
   * @returns {boolean} True if the value is a RegExp instance
   */
  private isRegExp = (value: unknown) => value instanceof RegExp;

  /**
   * Checks if a value is an array containing only strings
   *
   * @param {unknown} value - The value to check
   * @returns {boolean} True if the value is an array where every item is a string
   */
  private isStringArray = (value: unknown) => Array.isArray(value) && value.every((item) => typeof item === "string");

  /**
   * Checks if a value is a string
   *
   * @param {unknown} value - The value to check
   * @returns {boolean} True if the value is a string
   */
  private isString = (value: unknown) => typeof value === "string";

  /**
   * Checks if a value is a function
   *
   * @param {unknown} value - The value to check
   * @returns {boolean} True if the value is a function
   */
  private isFunction = (value: unknown) => typeof value === "function";

  /**
   * Removes the leading dot or hash from a CSS selector
   *
   * @param {string} selector - The CSS selector to process
   * @returns {string} The selector without the leading dot or hash
   */
  private removeClassAndId = (selector: string) => selector.replace(/^(\.|#)/, "");

  /**
   * Sets up a mutation observer to watch for the main element being re-added to the page. This handles cases where the
   * entire main content area is replaced in SPAs. Only one observer is created globally and shared across all test
   * instances.
   *
   * @throws {Error} If the HTML element cannot be found
   */
  private bindMainRemovalListener = () => {
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
              if (node.nodeName !== this.state.options.removedNode) return;
              // the MAIN element has been re-added, so re-init this test
              this.log(`Main element re-added, restarting test`, "warn");
              await this.init();
            } catch (e) {
              this.throwError(e);
            }
          });
        });
      };

      window.jfSPA.reapplyListener = useMutationObserver("ReapplyListener");
      window.jfSPA.reapplyListener.observe(target, config, callback);
    } catch (e) {
      this.throwError(e);
    }
  };

  /**
   * Sets up a mutation observer to detect page changes in Single Page Applications. Watches for changes to meta
   * description or canonical link elements. Only one observer is created globally and shared across all test
   * instances.
   *
   * @throws {Error} If observer setup fails
   */
  private bindPageChangeListener = () => {
    // Abort if we've already added this listener as we only need one
    if (!!window.jfSPA.pageListener) return;
    try {
      // bind to html
      const target = document.querySelector("html");

      const config: MutationObserverInit = { childList: true, subtree: true };

      const callback: MutationCallback = () => {
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
      this.throwError(e);
    }
  };

  public async init(): Promise<void> {
    try {
      // If we have pageMatch, then check that first before we run anything
      if (!!this.state.options.pageMatch) {
        const pageNotMatched = () => {
          // Not the right page
          this.log("Page not matched", "error");
          // Reset the test
          this.reset();
        };

        // Check if it's regex
        if (this.isRegExp(this.state.options.pageMatch)) {
          // It's regex
          const regex = new RegExp(this.state.options.pageMatch, "gi");
          if (!regex.test(window.location.pathname)) {
            pageNotMatched();
            return;
          }
        }

        // Check if it's an array of strings
        if (this.isStringArray(this.state.options.pageMatch)) {
          // It's an array, so loop it and check each one
          let matched = false;
          for (let i = 0; i < this.state.options.pageMatch.length; i++) {
            // if this page matches, update the value to true
            if (window.location.pathname == this.state.options.pageMatch[i]) matched = true;
          }

          // if none of the pages matched, quit out
          if (!!!matched) {
            pageNotMatched();
            return;
          }
        }

        // Check if it's a string
        if (this.isString(this.state.options.pageMatch)) {
          // It's a string, so check if pathname matches
          if (window.location.pathname !== this.state.options.pageMatch) {
            pageNotMatched();
            return;
          }
        }
      }

      this.log(`Page matched!`, "success");

      // Wait for the body to exist to avoid issues
      await waitForElement("body");
      this.applyTest();
    } catch (e) {
      this.throwError(e);
    }
  }

  public reset(): void {
    this.log(`Resetting Test`, "info");
    // Remove the inserted stylesheet
    this.removeStyleSheet();
    // Run the reset function
    if (this.isFunction(this.state.options.resetFn)) this.state.options.resetFn();
  }

  public disconnect(): void {
    // wipe the test
    this.state.details.isRunning = false;
    // delete it from our records
    window.jfSPA.tests = window.jfSPA.tests.filter((test) => test.details.id !== this.state.details.id);
  }

  /**
   * Handles errors by formatting them and throwing with a consistent structure
   *
   * @param {SPAError | Error} error - The error to process
   * @throws {Error} A formatted error with test ID and details
   */
  private throwError(error: SPAError | Error) {
    const errorObj =
      error instanceof Error
        ? {
            code: "RUNTIME_ERROR" as const,
            message: error.message,
            details: error,
          }
        : error;

    throw new Error(`[${this.state.details.id}] ${errorObj.code}: ${errorObj.message}`, errorObj.details);
  }

  /**
   * Logs messages to the console with consistent formatting and color coding
   *
   * @param {string} message - The message to log
   * @param {LogLevel} level - The log level (info, detail, success, warn, error)
   * @param {unknown} [data] - Optional data to log alongside the message
   */
  private log(message: string, level: LogLevel = "info", data?: unknown) {
    const styles = {
      info: "background: #61afef; color: #fff; padding: 2px 5px;",
      detail: "background: #c162de; color: #fff; padding: 2px 5px;",
      success: "background: #8cc265; color: #fff; padding: 2px 5px;",
      warn: "background: #f0a45d; color: #fff; padding: 2px 5px;",
      error: "background: #ff616e; color: #fff; padding: 2px 5px;",
    };

    if (!!data) {
      console.log(`${this.state.details.id} %c${message}`, styles[level], data);
    } else {
      console.log(`${this.state.details.id} %c${message}`, styles[level]);
    }
  }

  /**
   * Validates the options passed to the constructor Checks for required options and validates types and CSS selectors
   *
   * @param {object} options - The options to validate
   * @returns {boolean} True if all options are valid
   * @throws {SPAError} If any validation fails
   */
  private validateOptions(options: {
    apply: () => void;
    reset?: () => void;
    style?: string;
    pageMatch: string | string[] | RegExp;
    watchForRemoval?: string | string[];
    removeOnPageChange?: string | string[];
  }): boolean {
    // Validate required
    if (!options.apply) {
      this.throwError({
        code: "MISSING_OPTION",
        message: "apply must be provided",
      });
      return false;
    }
    if (!options.pageMatch) {
      this.throwError({
        code: "MISSING_OPTION",
        message: "pageMatch must be provided",
      });
      return false;
    }

    // validate types
    if (!this.isFunction(options.apply)) {
      this.throwError({
        code: "INVALID_TYPE",
        message: "apply must be a function",
      });
      return false;
    }
    if (
      !(this.isRegExp(options.pageMatch) || this.isStringArray(options.pageMatch) || this.isString(options.pageMatch))
    ) {
      this.throwError({
        code: "INVALID_TYPE",
        message: "pageMatch must be a string, an array of strings, or a RegExp",
      });
      return false;
    }
    if (options.reset && !this.isFunction(options.reset)) {
      this.throwError({
        code: "INVALID_TYPE",
        message: "reset must be a function",
      });
      return false;
    }
    if (
      options.watchForRemoval &&
      !(this.isString(options.watchForRemoval) || this.isStringArray(options.watchForRemoval))
    ) {
      this.throwError({
        code: "INVALID_SELECTOR",
        message: "watchForRemoval must be a string or array of strings",
      });
      return false;
    }
    if (
      options.removeOnPageChange &&
      !(this.isString(options.removeOnPageChange) || this.isStringArray(options.removeOnPageChange))
    ) {
      this.throwError({
        code: "INVALID_SELECTOR",
        message: "removeOnPageChange must be a string or array of strings",
      });
      return false;
    }

    // validate css strings
    if (options.watchForRemoval && !this.validateSelectors(options.watchForRemoval)) {
      this.throwError({
        code: "INVALID_SELECTOR",
        message: "watchForRemoval must be valid CSS selectors",
      });
      return false;
    }
    if (options.removeOnPageChange && !this.validateSelectors(options.removeOnPageChange)) {
      this.throwError({
        code: "INVALID_SELECTOR",
        message: "removeOnPageChange must be valid CSS selectors",
      });
      return false;
    }

    return true;
  }

  /**
   * Validates if a CSS selector string is syntactically valid Tests the selector by attempting to use it in a
   * querySelector call
   *
   * @param {string} selector - The CSS selector to validate
   * @returns {boolean} True if the selector can be used in querySelector
   */
  private isSelectorValid(selector: string): boolean {
    try {
      document.createDocumentFragment().querySelector(selector);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates an array of CSS selectors or a single selector
   *
   * @param {string | string[]} selectors - The selector(s) to validate
   * @returns {boolean} True if all selectors are valid
   */
  private validateSelectors(selectors: string | string[]): boolean {
    const toValidate = Array.isArray(selectors) ? selectors : [selectors];
    return toValidate.every(this.isSelectorValid.bind(this));
  }

  /**
   * Handles page change events by removing specified elements and reinitializing the test
   *
   * @throws {Error} If reinitialization fails
   */
  private handlePageChange = async () => {
    try {
      this.log(`Page changed`, "info");
      if (!!this.state.options.removeOnPageChange) this.handleRemoveOnPageChange();
      await this.init();
    } catch (e) {
      this.throwError(e);
    }
  };

  /**
   * Removes elements specified in removeOnPageChange when a page change occurs For each selector:
   *
   * - Removes matching elements from the DOM
   * - Removes matching IDs from elements
   * - Removes matching classes from elements
   */
  private handleRemoveOnPageChange = () => {
    this.log(`- Removing elements`, "detail");
    const searchAndRemove = (selector: string) => {
      document.querySelectorAll(selector).forEach((el: Element) => {
        // remove class or id
        const parsedSelector = this.removeClassAndId(selector);
        // check for matching id and remove if found
        if (el.id && el.id == parsedSelector) el.removeAttribute("id");
        // check for matching class and remove if found
        if (el.classList.contains(parsedSelector)) el.classList.remove(parsedSelector);
        // remove the element
        el.remove();
      });
    };

    if (this.isString(this.state.options.removeOnPageChange)) {
      // it's a string, just search for it
      searchAndRemove(this.state.options.removeOnPageChange as string);
      return;
    }

    // otherwise it's an array, so loop and remove each
    (this.state.options.removeOnPageChange as string[]).forEach((selector) => {
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
  private applyTest = () => {
    try {
      this.log(`Applying Test`, "info");
      this.insertStyleSheet();
      this.bindWatchForRemoval();
      this.state.options.applyFn();
    } catch (e) {
      this.throwError(e);
    }
  };

  /**
   * Sets up mutation observers to watch for removal of specified elements When watched elements are removed, the test
   * will be reapplied up to 5 times After 5 reapplications, the test will be reset to prevent infinite loops
   *
   * @throws {Error} If observer setup fails
   */
  private bindWatchForRemoval = () => {
    try {
      if (!!!this.state.options.watchForRemoval) return;
      this.log(`+ Binding Removal Watcher`, "detail");

      // Create a new observer
      const observer = useMutationObserver(`_${this.state.details.id}_`);

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
                if (this.state.loopCount >= 6) return;

                // Define a function that checks if the element matches
                const checkElementMatches = async (string: string) => {
                  try {
                    const match = this.removeClassAndId(string);
                    // Check if it's an id or not
                    const isId = /^#/.test(string);
                    let isMatched = false;
                    // If it's an id and the removed node matches
                    if (isId && (node as Element)?.id == match) isMatched = true;
                    // If it's a class and the removed node matches
                    if (!isId && (node as Element)?.classList.contains(match)) isMatched = true;
                    // If we have a match, re-init
                    if (isMatched) {
                      this.log(`Element was removed, re-init`, "warn");
                      if (this.state.loopCount >= 5) {
                        this.log(`Max loop count reached, aborting`, "error");
                        this.reset();
                        return;
                      }
                      this.state.loopCount += 1;
                      await this.init();
                    }
                  } catch (e) {
                    this.throwError(e);
                  }
                };

                // First check if it's an array or a string
                if (Array.isArray(this.state.options.watchForRemoval)) {
                  (this.state.options.watchForRemoval as string[]).forEach((string) => {
                    checkElementMatches(string);
                  });
                  return;
                }

                // Otherwise its a string, so just pass it
                checkElementMatches(this.state.options.watchForRemoval as string);
              } catch (e) {
                this.throwError(e);
              }
            });
          } catch (e) {
            this.throwError(e);
          }
        });
      };
      observer.observe(target, config, callback);
    } catch (e) {
      this.throwError(e);
    }
  };

  /**
   * Inserts the test's stylesheet into the document if one is defined The stylesheet is given a unique ID based on the
   * test ID
   *
   * @throws {Error} If stylesheet insertion fails
   */
  private insertStyleSheet = () => {
    try {
      // Abort if we don't have a stylesheet
      if (!!!this.state.options.style) return;
      // Insert our stylesheet
      this.log(`+ Inserting Stylesheet`, "detail");
      insertStyle(this.state.options.style, `${this.state.details.id}--style`);
    } catch (e) {
      this.throwError(e);
    }
  };

  /**
   * Removes the test's stylesheet from the document Finds and removes all elements matching the test's style ID
   *
   * @throws {Error} If stylesheet removal fails
   */
  private removeStyleSheet = () => {
    try {
      document.querySelectorAll(`#${this.state.details.id}--style`).forEach((el) => el.remove());
    } catch (e) {
      this.throwError(e);
    }
  };
}
