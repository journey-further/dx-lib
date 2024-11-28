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

type SPAState = {
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

const STATE: SPAState = {
  options: {
    applyFn: () => null,
    pageMatch: /.*?/g,
    listenForPageChange: true,
  },
  loopCount: 0,
  details: {
    isRunning: false,
    /** @type {string} The ID the test has been setup with */
    id: null,
  },
};

console.log(STATE);

const removeClassAndId = (selector: string) => selector.replace(/^(\.|#)/, "");

const throwError = (e) => {
  console.warn(STATE.details.id, e);
  init = () => null;
};

const handlePageChange = async () => {
  try {
    console.log(`%cPage changed`, "background: #199bd7; color: #fff; padding: 2px 5px;");
    if (!!STATE.options.removeOnPageChange) handleRemoveOnPageChange();
    await init();
  } catch (e) {
    throwError(e);
  }
};

const handleRemoveOnPageChange = () => {
  console.log(`\t%cRemoving elements`, "background: #199bd7; color: #fff; padding: 2px 5px;");
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

  if (typeof STATE.options.removeOnPageChange == "string") {
    // it's a string, just search for it
    searchAndRemove(STATE.options.removeOnPageChange);
    return;
  }

  // otherwise it's an array, so loop and remove each
  STATE.options.removeOnPageChange.forEach((selector) => {
    searchAndRemove(selector);
  });
};

const applyTest = () => {
  try {
    console.log(`%cApplying Test`, "background: #199bd7; color: #fff; padding: 2px 5px;");
    insertStyleSheet();
    bindWatchForRemoval();
    STATE.options.applyFn();
  } catch (e) {
    throwError(e);
  }
};

const bindWatchForRemoval = () => {
  try {
    if (!!!STATE.options.watchForRemoval) return;
    console.log(`\t%cBinding Removal Watcher`, "background: purple; color: #fff; padding: 2px 5px;");

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
                    console.log(`%cElement was removed, re-init`, "background: orange; color: #fff; padding: 2px 5px;");
                    if (STATE.loopCount >= 5) {
                      console.log(
                        `%cMax loop count reached, aborting`,
                        "background: red; color: #fff; padding: 2px 5px;"
                      );
                      // FIXME: should we be running reset here?
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

const insertStyleSheet = () => {
  try {
    // Abort if we don't have a stylesheet
    if (!!!STATE.options.style) return;
    // Insert our stylesheet
    console.log(`\t%cInserting Stylesheet`, "background: purple; color: #fff; padding: 2px 5px;");
    insertStyle(STATE.options.style, `${STATE.details.id}--style`);
  } catch (e) {
    throwError(e);
  }
};

const removeStyleSheet = () => {
  try {
    document.querySelectorAll(`#${STATE.details.id}--style`).forEach((el) => el.remove());
  } catch (e) {
    throwError(e);
  }
};

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
            console.log(
              `%cMain element re-added, restarting test`,
              "background: green; color: #fff; padding: 2px 5px;"
            );
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

const bindPageChangeListener = () => {
  // Abort if we've already added this listener as we only need one
  if (!!window.jfSPA.pageListener) return;
  // console.log(`%cSetting Page Change Listener`, "background: #199bd7; color: #fff; padding: 2px 5px;");
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

const isSelectorValid = (selector) => {
  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch (e) {
    throwError(e);
    return false;
  }
};

/**
 * Start the test
 *
 * @returns {Promise<void>}
 */
let init = async () => {
  try {
    // If we have pageMatch, then check that first before we run anything
    if (!!STATE.options.pageMatch) {
      const pageNotMatched = () => {
        // Not the right page
        console.log(`%cPage not matched`, "background: red; color: #fff; padding: 2px 5px;");
        // Reset the test
        reset();
      };

      // Check if it's regex
      if (
        typeof STATE.options.pageMatch == "object" &&
        !Array.isArray(STATE.options.pageMatch) &&
        STATE.options.pageMatch.constructor.name == "RegExp"
      ) {
        // It's regex
        const regex = new RegExp(STATE.options.pageMatch, "gi");
        if (!regex.test(window.location.pathname)) {
          pageNotMatched();
          return;
        }
      }

      // Check if it's an array of strings
      if (
        typeof STATE.options.pageMatch == "object" &&
        Array.isArray(STATE.options.pageMatch) &&
        STATE.options.pageMatch.constructor.name == "Array"
      ) {
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
      if (typeof STATE.options.pageMatch == "string" && STATE.options.pageMatch.constructor.name == "String") {
        // It's a string, so check if pathname matches
        if (window.location.pathname !== STATE.options.pageMatch) {
          pageNotMatched();
          return;
        }
      }
    }

    console.log(`%cPage matched!`, "background: green; color: #fff; padding: 2px 5px;");

    // Wait for the body to exist to avoid issues
    await waitForElement("body");
    applyTest();
  } catch (e) {
    throwError(e);
  }
};

/** Reset the test */
const reset = () => {
  console.log(`\t%cResetting Test`, "background: #199bd7; color: #fff; padding: 2px 5px;");
  // Remove the inserted stylesheet
  removeStyleSheet();
  // Run the reset function
  if (!!STATE.options.resetFn && typeof STATE.options.resetFn == "function") STATE.options.resetFn();
};

/** Remove the test from the page */
const disconnect = () => {
  // wipe the test
  STATE.details.isRunning = false;
  // delete it from our records
  window.jfSPA.tests = window.jfSPA.tests.filter((test) => test.details.id !== STATE.details.id);
};

/**
 * Class framework to create and manage A/B tests on Single Page Apps.
 *
 * The `SPA` class provides a structured way to implement tests with features such as:
 *
 * - Applying test-specific styles and functions.
 * - Watching for element removal and reapplying the test automatically.
 * - Handling page changes.
 * - Cleaning up resources to prevent memory leaks or unintended side effects.
 *
 * The class integrates with globally scoped listeners and observers to manage tests effectively, even in dynamic
 * environments.
 *
 * @class
 * @param {string} id - The unique identifier for the test.
 * @param {object} options - Configuration options for the test setup.
 * @param {() => void} options.apply - The function to execute when the test is applied (required).
 * @param {() => void} [options.reset] - The function to reset the test (optional).
 * @param {string} [options.style] - The CSS styles to apply during the test (optional).
 * @param {string | string[] | RegExp} options.pageMatch - A regular expression to match the pages where the test should
 *   run (required).
 * @param {string | string[]} [options.watchForRemoval] - A CSS selector (or array of selectors) for elements to monitor
 *   for removal and trigger reapplication (optional).
 * @param {string | string[]} [options.removeOnPageChange] - A CSS selector (or array of selectors) for elements to
 *   remove when a page change is detected (optional).
 *
 *   Key Features:
 *
 *   - Automatically applies the test when initialized and ensures it only runs once.
 *   - Validates the test setup, including required parameters like `apply` and `pageMatch`.
 *   - Watches for specific DOM element removal and re-applies the test if necessary.
 *   - Listens for page changes in SPAs and ensures the test is applied or reset as needed.
 *   - Integrates with `useMutationObserver` and `waitForElement` utilities for DOM observation.
 *
 *   Usage:
 *
 *   ```typescript
 *   const test = new SPA("TestID", {
 *     apply: () => {
 *       console.log("Test applied");
 *     },
 *     reset: () => {
 *       console.log("Test reset");
 *     },
 *     style: ".my-test { color: red; }",
 *     pageMatch: /\/test-page/,
 *     watchForRemoval: "#test-element",
 *     removeOnPageChange: "#test-element",
 *   });
 *   test.init();
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
    if (!!!id) throw new Error("You must provide a Test ID");
    STATE.details.id = id;

    // const { apply, reset, style, pageMatch, watchForRemoval, removeOnPageChange } = options;

    window.jfSPA = window.jfSPA || { tests: [] };
    STATE.details.isRunning = !!window.jfSPA.tests.find((test) => test.details.id == id);
    if (STATE.details.isRunning) {
      console.log(`%cTest ${id} already setup`, "background: orange; color: #fff; padding: 2px 5px;");
      // change our init function so it does nothing as this version of the test doesn't need to run
      init = () => null;
      return;
    }

    console.log(`%cCreate Test: ${id}`, "background: green; color: #fff; padding: 2px 5px;");

    // Push it to global object and mark this as running
    window.jfSPA.tests.push(this);
    STATE.details.isRunning = true;

    // Add apply function
    if (!!!options.apply) throw new Error("apply function must be provided");
    if (typeof options.apply != "function") throw new Error("apply must be a function");
    STATE.options.applyFn = options.apply;

    // Define page match regex
    if (!!!options.pageMatch) throw new Error("pageMatch must be provided");

    // Check it's type
    if (
      (typeof options.pageMatch == "object" &&
        Array.isArray(options.pageMatch) &&
        options.pageMatch.length > 0 &&
        typeof options.pageMatch[0] == "string") ||
      typeof options.pageMatch == "string" ||
      (typeof options.pageMatch == "object" &&
        !Array.isArray(options.pageMatch) &&
        options.pageMatch.constructor.name == "RegExp")
    ) {
      // type passed, store it
      STATE.options.pageMatch = options.pageMatch;
    } else {
      // type not passed, throw an error
      throw new Error("pageMatch must be either a string, an array of strings, or a regular expression");
    }

    // Add reset function
    if (!!options.reset) {
      if (typeof options.reset != "function") throw new Error("reset must be a function");
      STATE.options.resetFn = options.reset;
    }

    // Add style sheet
    if (!!options.style) {
      // console.log(typeof style);
      // if (typeof style != "string") throw new Error("style must be a string");
      STATE.options.style = options.style;
    }

    // // Define whether this test should check page changes (default: true)
    // if (listenForPageChange !== null) {
    //   STATE.listenForPageChange = !!listenForPageChange;
    // }

    // Define whether we should watch for removal of an element to re-init
    if (!!options.watchForRemoval) {
      // Check type matches
      if (
        typeof options.watchForRemoval == "object" &&
        Array.isArray(options.watchForRemoval) &&
        options.watchForRemoval.length > 0 &&
        typeof options.watchForRemoval[0] == "string"
      ) {
        // it's an array, loop the strings and check each is a valid CSS selector
        let invalid = null;
        options.watchForRemoval.forEach((selector) => {
          const isValid = isSelectorValid(selector);
          if (!isValid) invalid = false;
        });
        if (!!invalid) throw new Error(`${invalid} is not a valid css selector`);
        // type passed, store it
        STATE.options.watchForRemoval = options.watchForRemoval;
      } else if (typeof options.watchForRemoval == "string") {
        const invalid = isSelectorValid(options.watchForRemoval);
        if (!invalid) throw new Error(`${invalid} is not a valid css selector`);
        // type passed, store it
        STATE.options.watchForRemoval = options.watchForRemoval;
      } else {
        // type not passed, throw error
        throw new Error("watchForRemoval must be a string or array of strings");
      }
    }

    // remove on page change storage
    if (!!options.removeOnPageChange) {
      // Check type matches
      if (
        typeof options.removeOnPageChange == "object" &&
        Array.isArray(options.removeOnPageChange) &&
        options.removeOnPageChange.length > 0 &&
        typeof options.removeOnPageChange[0] == "string"
      ) {
        // it's an array, loop the strings and check each is a valid CSS selector
        let invalid = null;
        options.removeOnPageChange.forEach((selector) => {
          const isValid = isSelectorValid(selector);
          if (!isValid) invalid = false;
        });
        if (!!invalid) throw new Error(`${invalid} is not a valid css selector`);
        // type passed, store it
        STATE.options.removeOnPageChange = options.removeOnPageChange;
      } else if (typeof options.removeOnPageChange == "string") {
        const invalid = isSelectorValid(options.removeOnPageChange);
        if (!invalid) throw new Error(`${invalid} is not a valid css selector`);
        // type passed, store it
        STATE.options.removeOnPageChange = options.removeOnPageChange;
      } else {
        // type not passed, throw error
        throw new Error("removeOnPageChange must be a string or array of strings");
      }
    }

    // Add our page change listener
    bindPageChangeListener();

    // Add our main element removal listener
    bindMainRemovalListener();

    // Bind an event to handle the page change
    console.log(`\t%cBinding Page Change`, "background: purple; color: #fff; padding: 2px 5px;");
    window.removeEventListener("wt-pagechange", handlePageChange);
    window.addEventListener("wt-pagechange", handlePageChange);
  } catch (e) {
    throwError(e);
  }
};

/** Start the test */
SPA.prototype.init = init;

/** Reset the test */
SPA.prototype.reset = reset;

/** Remove the test from the page */
SPA.prototype.disconnect = disconnect;

/**
 * Details about the test
 *
 * @property {boolean} isRunning Whether this test has been setup and is running on the page
 * @property {string} id The test ID that it has been setup with
 */
SPA.prototype.details = STATE.details;

/**
 * TODO:
 *
 * - Add removeOnPageChange - take a string or array of strings (must be class or id) and then on page change, as part of
 *   the runReset function, querySelectorAll the elements, remove the class/id (so that watchForRemoval doesn't fire)
 *   and remove the elements from the DOM
 * - Add documentation for each function
 * - Expose function to remove test from the window object
 */
