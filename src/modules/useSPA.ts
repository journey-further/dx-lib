import { destroyByPrefix } from "./destroyByPrefix";
import { insertStyle } from "./insertStyle";
import { useMutationObserver } from "./useMutationObserver";
import { waitForElement } from "./waitForElement";
import {
  createLogger,
  jfError,
  reportError,
  isFunction,
  isNumber,
  isString,
  isStringArray,
  isRegExp,
  validateSelectors,
  isObject,
  isNodeAsElement,
} from "../helpers";
import { debounce } from "./debounce";

const PAGE_CHANGE_VERSION = "1.0";
const REINIT_VERSION = "1.0";

/**
 * Type guard to check if an unknown value is a JfSPAPageOptions instance
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is a JfSPAPageOptions instance
 */
export const isLocationObject = (value: unknown): value is JfSPAPageOptions =>
  value instanceof Object && "match" in value;

/**
 * Type guard to check if a value is matches one of "pathname", "hostname", "href", "hash", "search"
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} True if the value is one of: "pathname", "hostname", "href", "hash", "search"
 */
export const isPageObjectType = (value: unknown): value is "pathname" | "hostname" | "href" | "hash" | "search" =>
  typeof value === "string" &&
  (value == "pathname" || value == "hostname" || value == "href" || value == "hash" || value == "search");

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
  /** True after the page URL check passes */
  pageMatched: boolean;
  /** True after the apply function completes */
  isApplied: boolean;
  /** True after the reset function completes */
  isReset: boolean;
}

/**
 * Interface for an useSPA return instance
 *
 * - `details` Provides details of the running test
 * - `destroy` Completely removes the test and cleans up any registered listeners
 * - `reset` Resets the test by removing styles and executing the reset function if provided
 * - `init` Start the test using the options provided
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
   *   Test.destroy();
   */
  destroy: () => void;
  /**
   * Resets the test by removing styles and executing the reset function if provided
   *
   * @example
   *   Test.reset();
   */
  reset: () => Promise<void>;
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
   *     location: "/test-page", // or ["/page1", "/page2"] or /\/test-./
   *     watchForRemoval: "#test-element",
   *     removeOnPageChange: [".test-class", "#test-id"],
   *     alwaysReset: true,
   *   });
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
 * Configuration options for SPA test initialization
 *
 * @property {() => void} apply - Function to execute when applying the test
 * @property {() => void} [reset] - Optional function to execute when resetting the test
 * @property {string} [style] - Optional CSS styles to apply
 * @property {string | string[] | RegExp | JfSPAPageOptions} location - Pattern(s) to match the current page URL
 * @property {string | string[]} [watchForRemoval] - Selector(s) to watch for removal
 * @property {string | string[]} [removeOnPageChange] - Selector(s) for elements to remove on page change
 * @property {string} [removedNode] - Name of node to watch for removal
 * @interface JfSPAOptions
 */
export interface JfSPAOptions {
  /** Function to execute when applying the test. _(required)_ */
  apply: () => unknown;
  /** Function to execute when resetting the test */
  reset?: () => unknown | Promise<unknown>;
  /** CSS styles to apply during the test. Will apply only once, using the test's `id` as a unique identifier */
  style?: string;
  /**
   * Pattern(s) to match the current page against. _(required)_
   *
   * If passing just a string, array of strings, or regex pattern, this will be matched against the page path.
   * Alternatively, if passing an options object, you can include:
   *
   * - `match` A string, array of strings, or regex pattern to match _(required)_
   * - `type` The location scope to match against - can be any of: pathname, hostname, href, hash, search _(default:
   *   pathname)_
   * - `condition` A function that returns `true` or `false` to determine if the page is the correct one. Will poll every
   *   50ms until the `timeout` is reached
   * - `timeout` How long in ms to wait before declaring the page condition not matched _(default: 2000)_
   *
   * @example
   *   // match pages with a regex string
   *   location: /product/";
   *   // match a page with a string (string == window.location.pathname)
   *   location: "/";
   *   // match multiple pages (same as above)
   *   location: ["/", "/home"];
   *
   * @example
   *   // match using an advanced options object
   *   location: {
   *   match: "https://www.",
   *   type: "href",
   *   condition: () => !!document.querySelector(".product")
   *   }
   */
  location: string | string[] | RegExp | JfSPAPageOptions;
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
  /**
   * Whether to run the reset function on every page change, rather than only when the page does not match _(default:
   * false)_
   */
  alwaysReset?: boolean;
  /**
   * Whether to limit the test to only run on specific screen sizes. Will add a resize listener to the page, and run the
   * `reset` and `apply` functions if the page falls outside/inside the given bounds.
   *
   * One or both of `minWidth` and `maxWidth` can be provided
   *
   * @example
   *   // This will only run on screens between 601px and 1023px
   *   screen: {
   *   minWidth: 601,
   *   maxWidth: 1023
   *   }
   *
   *   // This will run on any screen smaller than 767px
   *   screen: {
   *   maxWidth: 767
   *   }
   */
  screen?: {
    /** The minimum screen width to apply the test. Screens **smaller** than this will be excluded */
    minWidth?: number;
    /** The maximum screen width to apply the test. Screens **larger** than this will be excluded */
    maxWidth?: number;
  };
}

export interface JfSPAPageOptions {
  match: string | string[] | RegExp;
  type?: "pathname" | "hostname" | "href" | "hash" | "search";
  condition?: () => boolean;
  timeout?: number;
}

/**
 * Creates a new SPA test instance for implementing A/B tests on Single Page Applications.
 *
 * Function provides a structured way to implement tests with the following features:
 *
 * - Automatically applies the test when initialized and ensures it only runs once
 * - Validates the test setup, including required parameters like `apply` and `location`
 * - Watches for specific DOM element removal and re-applies the test if necessary
 * - Listens for page changes in SPAs and ensures the test is applied or reset as needed
 * - Integrates with mutation observers for reliable DOM monitoring
 * - Provides cleanup methods to prevent memory leaks
 *
 * The returned object provides methods to:
 *
 * - Start running a test (`init`)
 * - Reset a test (`reset`)
 * - Completely remove a test (`destroy`)
 * - Get details of the test (`details`)
 *
 * @example
 *   const resetChanges = () => {
 *     // undo something
 *   };
 *
 *   const applyChanges = () => {
 *     // do something
 *   };
 *
 *   (async () => {
 *     try {
 *       const Test = useSPA("TestID");
 *
 *       // Start the test — await it, or setup/validation errors will surface only as unhandled rejections
 *       await Test.init({
 *         apply: applyChanges,
 *         reset: resetChanges,
 *         style: ".my-test { color: red; }",
 *         location: "/test-page", // or ["/page1", "/page2"] or /.*?/
 *         watchForRemoval: "#test-element",
 *         removeOnPageChange: [".test-class", "#test-id"],
 *         alwaysReset: true,
 *       });
 *
 *       // Reset the test
 *       Test.reset();
 *
 *       // Remove the test completely
 *       Test.destroy();
 *
 *       // Store the test for later use
 *       STATE.Test = Test;
 *     } catch (e) {
 *       // ...
 *     }
 *   })();
 *
 * @param {string} id Unique identifier for the test - will prevent the test from being run multiple times
 * @returns Functions:
 *
 *   - `details` Get details of the test
 *   - `init` Function to start the test
 *   - `reset` Function to reset the test, using the passed `reset` function
 *   - `destroy` Function to completely remove this test
 */
export const useSPA = (id: string): JfSPA => {
  // Setup initial state
  const STATE: JfSPAState = {
    options: {
      apply: () => null,
      location: {
        match: /.*?/g,
        type: "pathname",
      },
      alwaysReset: false,
      removedNode: "MAIN",
    },
    loopCount: 0,
    details: {
      isRunning: false,
      id: "",
      pageMatched: false,
      isApplied: false,
      isReset: false,
    },
  };
  const log = createLogger(`[${id}] useSPA`);
  // Set by destroy() — checked before any (re-)apply so a destroyed test can never zombie back
  let destroyed = false;
  /**
   * Sets up the SPA test with provided options
   *
   * @param {JfSPAOptions} options - Configuration options for the test
   * @throws {Error} If setup fails or invalid options provided
   */
  const setupTest = (options: JfSPAOptions) => {
    try {
      // Check an id has been provided
      if (!!!id) {
        throw new Error("You must provide a Test ID");
      }
      // Push the id
      STATE.details.id = id;

      // Check if this test is already setup — a fresh object per assignment, so an external
      // wipe of window.jfLib can never resurrect stale module-level state
      window.jfLib = window.jfLib || {
        pagePath: window.location.pathname + window.location.search + window.location.hash,
        experiments: [],
      };
      window.jfLib.experiments = window.jfLib.experiments || [];
      const alreadyRunning = !!window.jfLib.experiments.find((test) => test?.details && test?.details?.id == id);
      if (alreadyRunning) {
        log(`Test already setup`, "warn");
        // initTest = () => null;
        return false;
      }

      log(`Creating Test`, "success", options);

      const hasValidOptions = validateOptions(options);
      if (!hasValidOptions) {
        return false;
      }

      const { apply, location, reset, style, watchForRemoval, removeOnPageChange, removedNode, alwaysReset, screen } =
        options;

      // Add required options
      STATE.options.apply = apply;

      // If location is JfSPAPageOptions then just pass it along
      if (isLocationObject(location)) {
        // Setup options
        const pageOptions: JfSPAPageOptions = {
          match: location.match,
          type: location.type || "pathname",
        };
        // If we have a condition, add that
        if (!!location.condition) {
          pageOptions.condition = location.condition;
          pageOptions.timeout = location.timeout || 2000;
        }
        // Push it to options
        STATE.options.location = pageOptions;
      } else {
        // Otherwise, we presume it's just a string/string[]/RegExp on the path, so pass
        STATE.options.location = {
          match: location,
          type: "pathname",
        };
      }

      // Add reset function
      if (!!reset) STATE.options.reset = reset;

      // Add style sheet
      if (!!style) STATE.options.style = style;

      // Define whether we should watch for removal of an element to re-init
      if (!!watchForRemoval) STATE.options.watchForRemoval = watchForRemoval;

      // Define whether to remove specific elements on page change
      if (!!removeOnPageChange) STATE.options.removeOnPageChange = removeOnPageChange;

      // Overwrite the nodeName used to detect if SPA has been wiped
      if (!!removedNode) STATE.options.removedNode = removedNode.toUpperCase();

      // Set whether to run the reset function on each page change
      if (!!alwaysReset) STATE.options.alwaysReset = alwaysReset;

      // Add our page change listener
      bindPageChangeListener();

      // Add our main element removal listener
      bindReInitListener();

      // Bind an event to handle the page change
      log(`+ Binding Page Change Listener`, "detail");
      window.removeEventListener(`jf-pagechange-${PAGE_CHANGE_VERSION}`, handlePageChange);
      window.addEventListener(`jf-pagechange-${PAGE_CHANGE_VERSION}`, handlePageChange);

      // Bind an event to handle the page change
      log(`+ Binding SPA Re-init Listener`, "detail");
      window.removeEventListener(`jf-reinit-${REINIT_VERSION}`, handleReInit);
      window.addEventListener(`jf-reinit-${REINIT_VERSION}`, handleReInit);

      if (!!screen) {
        // copy with defaults — never mutate the caller's (possibly frozen/shared) options object
        STATE.options.screen = { minWidth: 0, maxWidth: 99999, ...screen };
        // Bind an event to handle the page change
        log(`+ Binding Resize Listener`, "detail");
        window.removeEventListener(`resize`, handleResize);
        window.addEventListener(`resize`, handleResize);
      }

      // Push this test to global object and mark it as running
      STATE.details.isRunning = true;
      window.jfLib.experiments.push(publicApi);
      return true;
    } catch (e) {
      log("Setup Error", "error", STATE);
      throw e;
    }
  };

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
  const bindReInitListener = () => {
    window.jfLib.reInit = window.jfLib.reInit || {};
    // The observer is a shared singleton — later instances register their removedNode in the
    // shared nodeNames set instead of being ignored (the observer must not close over one test's option)
    const existing = window.jfLib.reInit[REINIT_VERSION];
    if (existing) {
      existing.nodeNames?.add(STATE.options.removedNode);
      return;
    }
    try {
      const target = document.querySelector("html");
      if (!!!target) throw new Error("no target");
      const config: MutationObserverInit = { childList: true, subtree: true };

      const nodeNames = new Set<string>([STATE.options.removedNode]);
      const callback: MutationCallback = (mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length === 0) return;
          mutation.addedNodes.forEach((node) => {
            try {
              if (!nodeNames.has(node.nodeName)) return;
              // a watched element has been re-added, so dispatch an event
              window.dispatchEvent(new Event(`jf-reinit-${REINIT_VERSION}`));
            } catch (e) {
              reportLifecycle(e);
            }
          });
        });
      };

      // Setup the reInit observer
      window.jfLib.reInit[REINIT_VERSION] = { observer: useMutationObserver(`reInit-${REINIT_VERSION}`), nodeNames };
      window.jfLib.reInit[REINIT_VERSION].observer.observe(target, config, callback);
    } catch (e) {
      log("Re-Init Error", "error");
      throwError(e);
    }
  };

  /**
   * Sets up a mutation observer to detect page changes in Single Page Applications by comparing the full location
   * (path + search + hash) against the last seen value on every DOM mutation. Only one observer is created globally
   * and shared across all test instances.
   *
   * @throws {Error} If observer setup fails
   */
  const bindPageChangeListener = () => {
    window.jfLib.pageChange = window.jfLib.pageChange || {};
    // Abort if we've already added this listener as we only need one
    if (!!window.jfLib.pageChange[PAGE_CHANGE_VERSION]) return;
    try {
      // bind to html
      const target = document.querySelector("html");

      const config: MutationObserverInit = { childList: true, subtree: true };

      const callback: MutationCallback = () => {
        // compare the full location — pathname alone misses query-string and hash navigations
        const current = window.location.pathname + window.location.search + window.location.hash;
        if (typeof window.jfLib?.pagePath !== "string" || current === window.jfLib.pagePath) return;

        // Update the current path
        window.jfLib.pagePath = current;

        // Dispatch an event
        window.dispatchEvent(new Event(`jf-pagechange-${PAGE_CHANGE_VERSION}`));
      };

      // Setup the reInit observer
      window.jfLib.pageChange[PAGE_CHANGE_VERSION] = {
        observer: useMutationObserver(`pageChange-${PAGE_CHANGE_VERSION}`),
      };
      window.jfLib.pageChange[PAGE_CHANGE_VERSION].observer.observe(target, config, callback);

      // Set the current path initially
      window.jfLib.pagePath = window.location.pathname + window.location.search + window.location.hash;
    } catch (e) {
      log("Page Change Error", "error");
      throwError(e);
    }
  };

  const checkPageUrl = () => {
    try {
      // After setupTest, location is always a JfSPAPageOptions object
      const locationObj = STATE.options.location as JfSPAPageOptions;
      const { match, type } = locationObj;
      log(`Checking URL`, "info", `type: ${type}, match: ${match}`);

      // Check if it's regex
      if (isRegExp(match)) {
        // use the user's RegExp as-is (its case sensitivity and flags are respected) — only strip
        // g/y so a stateful lastIndex can't make repeated checks flaky
        const regex = match.global || match.sticky ? new RegExp(match.source, match.flags.replace(/[gy]/g, "")) : match;
        if (!regex.test(window.location[type])) {
          return false;
        }
      }

      // Check if it's an array of strings
      if (isStringArray(match)) {
        // It's an array, so filter to find the ones that match
        const findMatch = match.filter((u) => window.location[type] == u).length != 0;

        // if none of the pages matched, quit out
        if (!findMatch) {
          return false;
        }
      }

      // Check if it's a string
      if (isString(match)) {
        // It's a string, so check if url matches
        if (window.location[type] !== match) {
          return false;
        }
      }

      log(`+ URL matched`, "success");
      return true;
    } catch (error) {
      reportLifecycle(error);
      return false;
    }
  };

  const checkPageCondition = async () => {
    try {
      // After setupTest, location is always a JfSPAPageOptions object
      const locationObj = STATE.options.location as JfSPAPageOptions;
      const { condition, timeout } = locationObj;
      if (condition == null) return true;
      log(`Checking page condition`, "info", `timeout: ${timeout}ms`);

      const conditionMatched = await new Promise((resolve) => {
        let totalTime = 0;
        const interval = setInterval(() => {
          // Update our timer log
          totalTime += 50;

          // Abort if we're over the timeout
          if (totalTime >= timeout) {
            clearTimeout(interval);
            log(`Timeout (${timeout}ms) exceeded for page match condition`, "error");
            resolve(false);
          }

          // Run our condition check, and if its true, then return a true value and stop polling
          if (isFunction(condition) && condition() == true) {
            clearTimeout(interval);
            log(`+ Condition matched`, "success");
            resolve(true);
          }
        }, 50);
      });

      if (!conditionMatched) return false;
      return true;
    } catch (error) {
      reportLifecycle(error);
      return false;
    }
  };

  /**
   * Initializes the test if the current page matches the configured patterns
   *
   * @returns {Promise<void>}
   * @throws {Error} If initialization fails
   */
  const initTest = async (): Promise<void> => {
    try {
      if (destroyed) return;
      // NOTE: check screen size here if options for screen is passed and resetTest is wrong size
      if (!!STATE.options.screen) {
        if (!isScreenInBounds()) {
          log("Screen is outside the configured min/max bounds, resetting", "warn", STATE.options.screen);
          await resetTest();
          return;
        }
        log("Screen is correct size, proceeding", "info");
      }

      // Check if the URL matches
      const urlMatched = checkPageUrl();
      if (!urlMatched) {
        // Not the right page
        log("Page URL not matched", "info");
        // Reset the test
        await resetTest();
        // quit
        return;
      }

      // Check if the page conditions match
      const conditionMatched = await checkPageCondition();
      if (!conditionMatched) {
        // Reset the test
        await resetTest();
        // quit
        return;
      }

      log(`Page matched!`, "success");
      STATE.details.pageMatched = true;

      // Wait for the body to exist to avoid issues
      await waitForElement("body");

      // Apply the test
      await applyTest();
    } catch (e) {
      reportLifecycle(e);
    }
  };

  /**
   * Resets the test by removing styles and executing the reset function if provided
   *
   * @returns {Promise<void>}
   */
  const resetTest = async (): Promise<void> => {
    log(`Resetting Test`, "info");
    removeStyleSheet();

    // Sweep every auto-tracked resource registered under this test's id (element* callbacks + jfReady
    // marks, customEvents listeners, jfListeners/jfTimers/jfObservers) — runs on every reset
    destroyByPrefix(STATE.details.id);

    try {
      if (isFunction(STATE.options.reset)) await STATE.options.reset();
    } catch (e) {
      reportLifecycle(e);
    } finally {
      // a rejecting user reset must not leave isApplied stuck true
      STATE.details.isApplied = false;
      STATE.details.isReset = true;
      STATE.details.pageMatched = false;
    }
  };

  /**
   * Completely removes the test and cleans up any registered listeners
   *
   * @returns {void}
   */
  const removeTest = (): void => {
    // wipe the test — initTest checks this flag so no surviving event can re-apply
    destroyed = true;
    STATE.details.isRunning = false;
    // unhook this instance's listeners
    window.removeEventListener(`jf-pagechange-${PAGE_CHANGE_VERSION}`, handlePageChange);
    window.removeEventListener(`jf-reinit-${REINIT_VERSION}`, handleReInit);
    window.removeEventListener("resize", handleResize);
    // disconnect the per-test removal observer
    if (!!STATE.options.watchForRemoval) useMutationObserver(`_${STATE.details.id}_`).disconnect();
    // sweep every auto-tracked resource registered under this test's id
    destroyByPrefix(STATE.details.id);
    // delete it from our records
    if (window.jfLib?.experiments) {
      window.jfLib.experiments = window.jfLib.experiments.filter((test) => test.details.id !== STATE.details.id);
    }
  };

  /**
   * Handles errors by formatting them and throwing with a consistent structure. Only for setup/validation paths where
   * the caller is awaiting `init` — post-init lifecycle paths must use `reportLifecycle` instead
   *
   * @param {JfSPAError | Error} error - The error to process
   * @throws {Error} A formatted error with test ID and details
   */
  const throwError = (error: JfSPAError | Error): never => {
    const errorObj =
      error instanceof Error
        ? {
            code: "RUNTIME_ERROR" as const,
            message: error.message,
            details: error,
          }
        : error;

    // If it's already a formatted error, throw as-is
    if (error.message.includes(`[${STATE?.details?.id}]`)) {
      throw error;
    }
    // Otherwise, format the error
    throw jfError(errorObj.code, `[${STATE?.details?.id}] ${errorObj.code}: ${errorObj.message}`, errorObj?.details);
  };

  /**
   * The non-throwing side of the error channel: reports a lifecycle error on the wire (`jf-err-1.0`) and to the
   * console, without propagating. Every post-init lifecycle path routes through this — an async event listener has no
   * caller to throw to, so throwing there is just an invisible unhandled rejection
   *
   * @param {JfSPAError | Error | unknown} error - The error to report
   */
  const reportLifecycle = (error: unknown): void => {
    const err =
      error instanceof Error
        ? error
        : typeof error === "object" && error !== null && "message" in error
          ? new Error(`${(error as JfSPAError).code}: ${(error as JfSPAError).message}`)
          : new Error(String(error));
    reportError(STATE.details.id || id, err);
  };

  /**
   * Validates the options passed to the constructor Checks for required options and validates types and CSS selectors
   *
   * @param {object} options - The options to validate
   * @returns {boolean} True if all options are valid
   * @throws {JfSPAError} If any validation fails
   */
  const validateOptions = (options: JfSPAOptions): boolean => {
    const { apply, location, reset, watchForRemoval, removeOnPageChange, removedNode, screen } = options;

    // -- VALIDATE REQUIRED OPTIONS --
    // Check we have 'apply'
    if (!apply) {
      throwError({
        code: "MISSING_OPTION",
        message: "apply must be provided",
      });
    }
    // Check we have 'location'
    if (!location) {
      throwError({
        code: "MISSING_OPTION",
        message: "location must be provided",
      });
    }
    // If we've been passed an object for 'location', check it has a 'match' property
    if (isLocationObject(location)) {
      if (!!!location.match) {
        throwError({
          code: "MISSING_OPTION",
          message: "location.match must be provided",
        });
      }
    }

    // -- VALIDATE TYPES --
    // Check 'apply' is a function
    if (!isFunction(apply)) {
      throwError({
        code: "INVALID_TYPE",
        message: "apply must be a function",
      });
    }
    // Check 'location' is string|string[]|RegExp|JfSPAPageObject
    if (!(isRegExp(location) || isStringArray(location) || isString(location) || isLocationObject(location))) {
      throwError({
        code: "INVALID_TYPE",
        message: "location must be a string, an array of strings, a RegExp match, or an options object",
      });
    }
    // If 'location' is JfSPAPageObject
    if (isLocationObject(location)) {
      const { match, type, condition, timeout } = location;
      // Check 'match' is string|string[]|RegExp
      if (!(isRegExp(match) || isStringArray(match) || isString(match))) {
        throwError({
          code: "INVALID_TYPE",
          message: "location.match must be a string, an array of strings, a RegExp match",
        });
      }
      // Check 'type' is path or href
      if (type && !isPageObjectType(type)) {
        throwError({
          code: "INVALID_TYPE",
          message: "location.type must be one of: pathname, hostname, href, hash, search",
        });
      }
      // Check 'condition' is path or href
      if (condition && !isFunction(condition)) {
        throwError({
          code: "INVALID_TYPE",
          message: "location.condition must be a function",
        });
      }
      // Check 'type' is path or href
      if (timeout && !isNumber(timeout)) {
        throwError({
          code: "INVALID_TYPE",
          message: "location.timeout must be a number",
        });
      }
    }

    if (reset && !isFunction(reset)) {
      throwError({
        code: "INVALID_TYPE",
        message: "reset must be a function",
      });
    }
    if (watchForRemoval && !(isString(watchForRemoval) || isStringArray(watchForRemoval))) {
      throwError({
        code: "INVALID_SELECTOR",
        message: "watchForRemoval must be a string or array of strings",
      });
    }
    if (removeOnPageChange && !(isString(removeOnPageChange) || isStringArray(removeOnPageChange))) {
      throwError({
        code: "INVALID_SELECTOR",
        message: "removeOnPageChange must be a string or array of strings",
      });
    }

    // validate css strings
    if (watchForRemoval && !validateSelectors(watchForRemoval)) {
      throwError({
        code: "INVALID_SELECTOR",
        message: "watchForRemoval must be valid CSS selectors",
      });
    }
    if (removeOnPageChange && !validateSelectors(removeOnPageChange)) {
      throwError({
        code: "INVALID_SELECTOR",
        message: "removeOnPageChange must be valid CSS selectors",
      });
    }

    if (removedNode && !isString(removedNode)) {
      throwError({
        code: "INVALID_TYPE",
        message: "removedNode must be a string",
      });
    }

    if (screen) {
      // If screen isn't an object, or doesn't contain one of minWidth/maxWidth, throw error
      if (!isObject(screen) || (screen.minWidth === undefined && screen.maxWidth === undefined)) {
        throwError({
          code: "INVALID_TYPE",
          message: "screen must be an object containing one of: minWidth, maxWidth",
        });
      }
      if (!!screen.minWidth && !isNumber(screen.minWidth)) {
        throwError({
          code: "INVALID_TYPE",
          message: "minWidth must be a number",
        });
      }
      if (!!screen.maxWidth && !isNumber(screen.maxWidth)) {
        throwError({
          code: "INVALID_TYPE",
          message: "maxWidth must be a number",
        });
      }
      // TODO: need some error checking if the passed value is 0 as this may cause issues (and the minimum should be greater than this anyway)
    }

    return true;
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
      // a new page starts a new removal-watch loop — the reapply cap is per loop, not per session
      STATE.loopCount = 0;
      if (!!STATE.options.removeOnPageChange) handleRemoveOnPageChange();
      await initTest();
    } catch (e) {
      reportLifecycle(e);
    }
  };

  /**
   * Handles SPA reset events when the entire DOM is reset, restarting the test
   *
   * @returns {Promise<void>}
   * @throws {Error} If SPA reinit handling fails
   */
  const handleReInit = async () => {
    try {
      log(`SPA reset, restarting test`, "warn");
      await initTest();
    } catch (e) {
      reportLifecycle(e);
    }
  };

  /**
   * The single bounds check shared by init and resize paths — inclusive on both ends so exact
   * breakpoint widths (an iPad rotating onto 768/1024) behave the same on load and on resize
   *
   * @returns {boolean} True when the current width is within the configured screen bounds
   */
  const isScreenInBounds = (): boolean => {
    const { minWidth, maxWidth } = STATE.options.screen;
    return window.innerWidth >= minWidth && window.innerWidth <= maxWidth;
  };

  /**
   * Handles window resize events, using the `minWidth` and/or `maxWidth` passed in the `screen` options
   *
   * @returns {Promise<void>}
   * @throws {Error} If resize handling fails
   */
  const handleResizeDebounced = debounce(async () => {
    try {
      if (isScreenInBounds()) {
        log("Screen is correct size", "info");
        await initTest();
        return;
      }

      log("Screen is outside the configured min/max bounds, resetting", "warn", STATE.options.screen);
      await resetTest();
    } catch (e) {
      reportLifecycle(e);
    }
  }, 100);

  // Create handler wrapper for resize to maintain reference for cleanup
  const handleResize = handleResizeDebounced;

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
    const { removeOnPageChange } = STATE.options;
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

    if (isString(removeOnPageChange)) {
      // it's a string, just search for it
      searchAndRemove(removeOnPageChange as string);
      return;
    }

    // otherwise it's an array, so loop and remove each
    (removeOnPageChange as string[]).forEach((selector) => {
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
  const applyTest = async () => {
    try {
      // If we have specified to always reset, then run the reset function here
      if (!!STATE.options.alwaysReset) await resetTest();
      log(`Applying Test`, "info");
      // Insert our stylesheet (if we have it)
      if (!!STATE.options.style) await insertStyleSheet();
      //
      bindWatchForRemoval();
      // await the build's apply (async apply is the norm in SPA tests) — isApplied only flips on success
      await Promise.resolve(STATE.options.apply());
      STATE.details.isApplied = true;
      STATE.details.isReset = false;
    } catch (e) {
      // the current apply did not complete — isApplied must not claim it did
      STATE.details.isApplied = false;
      reportLifecycle(e);
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
      const { watchForRemoval } = STATE.options;
      if (!!!watchForRemoval) return;
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

                // Define a function that checks if the element matches
                const checkElementMatches = async (selector: string) => {
                  try {
                    if (!isNodeAsElement(node)) return;
                    if (node.matches(selector)) {
                      log(`Element was removed, re-init`, "warn");
                      if (STATE.loopCount >= 5) {
                        // reset exactly once at the cap — further removals must not re-run the user's reset
                        if (STATE.loopCount === 5) {
                          log(`Max loop count reached, aborting`, "error");
                          STATE.loopCount += 1;
                          await resetTest();
                        }
                        return;
                      }
                      STATE.loopCount += 1;
                      await initTest();
                    }
                  } catch (e) {
                    reportLifecycle(e);
                  }
                };

                // First check if it's an array or a string
                if (Array.isArray(STATE.options.watchForRemoval)) {
                  // Use for...of to properly await async operations
                  for (const string of STATE.options.watchForRemoval as string[]) {
                    await checkElementMatches(string);
                  }
                  return;
                }

                // Otherwise its a string, so just pass it
                await checkElementMatches(STATE.options.watchForRemoval as string);
              } catch (e) {
                reportLifecycle(e);
              }
            });
          } catch (e) {
            reportLifecycle(e);
          }
        });
      };
      observer.observe(target, config, callback);
    } catch (e) {
      reportLifecycle(e);
    }
  };

  /**
   * Inserts the test's stylesheet into the document if one is defined The stylesheet is given a unique ID based on the
   * test ID
   *
   * @throws {Error} If stylesheet insertion fails
   */
  const insertStyleSheet = async () => {
    // Abort if we don't have a stylesheet
    if (!!!STATE.options.style) return;
    // Insert our stylesheet — awaited so a failed insertion surfaces in applyTest's catch
    log(`+ Inserting styles`, "detail");
    await insertStyle(STATE.options.style, `${STATE.details.id}--style`);
  };

  /**
   * Removes the test's stylesheet from the document Finds and removes all elements matching the test's style ID
   *
   * @throws {Error} If stylesheet removal fails
   */
  const removeStyleSheet = () => {
    try {
      log(`- Removing styles`, "detail");
      document.querySelectorAll(`#${STATE.details.id}--style`).forEach((el) => el.remove());
    } catch (e) {
      reportLifecycle(e);
    }
  };

  const publicApi: JfSPA = {
    details: STATE.details,
    init: async (options: JfSPAOptions) => {
      try {
        const isSetup = setupTest(options);
        if (!!!isSetup) return;
        await initTest();
      } catch (error) {
        // report on the wire first — an un-awaited init would otherwise swallow this entirely
        reportLifecycle(error);
        throwError(error as JfSPAError | Error);
      }
    },
    reset: resetTest,
    destroy: removeTest,
  };
  return publicApi;
};
