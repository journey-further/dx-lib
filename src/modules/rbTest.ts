import { insertStyle } from "./insertStyle";
import { JfObserver, useMutationObserver } from "./useMutationObserver";
import { waitForElement } from "./waitForElement";

// -- TYPES --

export type RBTestOptions = {
  /** The function to apply when the test runs (required) */
  apply: () => void;
  /** Regex condition or string to check we're on the right page (required) */
  pageMatch: RegExp | string | string[];
  /** Function to run that will reset the test (optional) */
  reset?: () => void;
  /** Stylesheet to insert (optional) */
  style?: string;
  /** Selector of element (or array of selectors) to watch for removal and re-apply (optional) */
  watchForRemoval?: string | string[];
  /** Selector of element (or array of selectors) to remove from DOM on page change (optional) */
  removeOnPageChange?: string | string[];
  /** Number of loops to allow when an element is being removed/re-added (default: 5) */
  maxLoopCount?: number;
};

declare global {
  interface Window {
    jfTests: {
      tests: RBTest[];
      reapplyListener?: JfObserver;
      pageListener?: JfObserver;
      pagePath?: string;
    };
  }
}

// -- HELPERS --

/** Check if a string is a valid CSS selector */
const checkIsSelector = (selector: string | string[], fnName: string) => {
  const queryCheck = (s) => document.createDocumentFragment().querySelector(s);
  const isSelectorValid = (s) => {
    try {
      queryCheck(s);
    } catch {
      return false;
    }
    return true;
  };

  // check it's a string or an array
  if (typeof selector != "string" && selector.constructor.name != "Array")
    throw new TypeError(`${fnName} must be a string or array of strings`);
  // check it's not empty
  if (selector.length === 0) throw new Error(`${fnName} cannot be empty`);

  // if it is a string, check that it it's either an id or a class
  if (typeof selector == "string" && !isSelectorValid(selector))
    throw new Error(`${fnName} must be a valid CSS selector`);

  // if it's an Array, make sure we check it's a string/not empty for each entry
  if (typeof selector == "object") {
    selector.forEach((option) => {
      if (typeof option !== "string") throw new TypeError(`${fnName} array must contain strings`);
      if (option.length === 0) throw new Error(`${fnName} array cannot contain an empty string`);
    });
  }
};

const removeElementFromDOM = (selector: string) => {
  // use querySelectorAll in order to match all elements
  const elements = document.querySelectorAll(selector);
  // If we can't find the element, do nothing;
  if (elements.length == 0) return;
  // Remove each matching element
  elements.forEach((element) => element.remove());
  console.log(`%cRemoved elements: ${selector}`, "background: green; color: #fff; padding: 2px 5px;");
};

/**
 * Class framework to create a test structure on Russell & Bromley
 *
 * @param id Campaign ID
 * @param options Options for Test setup
 * @param options.apply The function to apply when the test runs (required)
 * @param options.pageMatch Regex condition or string to check we're on the right page (required)
 * @param options.reset Function to run that will reset the test (optional)
 * @param options.style Stylesheet to insert (optional)
 * @param options.watchForRemoval Selector of element (or array of selectors) to watch for removal and re-apply
 *   (optional)
 * @param options.removeOnPageChange Selector of element (or array of selectors) to remove from DOM on page change
 *   (optional)
 */
export class RBTest {
  isRunning = false;

  /** The function to apply when the test runs (required) */
  #apply: () => void;

  #reset: () => void | null = null;

  #style: string | null = null;

  #listenForPageChange = true;

  #watchForRemoval: string[] | string | null;

  #removeOnPageChange: string[] | string | null;

  #pageMatch: RegExp | string | string[];

  #loopCount = 0;

  #maxLoopCount = 5;

  id: string;

  /**
   * Class framework to create a test structure on Russell & Bromley
   *
   * @param id Campaign ID
   * @param options Options for Test setup
   * @param options.apply The function to apply when the test runs (required)
   * @param options.pageMatch Regex condition or string to check we're on the right page (required)
   * @param options.reset Function to run that will reset the test (optional)
   * @param options.style Stylesheet to insert (optional)
   * @param options.watchForRemoval Selector of element (or array of selectors) to watch for removal and re-apply
   *   (optional)
   * @param options.removeOnPageChange Selector of element (or array of selectors) to remove from DOM on page change
   *   (optional)
   */
  constructor(id: string, options: RBTestOptions) {
    try {
      if (!!!id) throw new Error("You must provide a Test ID");
      this.id = id;

      window.jfTests = window.jfTests || { tests: [] };
      this.isRunning = !!window.jfTests.tests.find((test) => test.id == id);
      if (this.isRunning) {
        console.log(`%cTest ${id} already setup`, "background: orange; color: #fff; padding: 2px 5px;");
        // change our init function so it does nothing as this version of the test doesn't need to run
        this.init = () => null;
        return;
      }

      console.log(`%cCreate RB Test: ${id}`, "background: green; color: #fff; padding: 2px 5px;");

      // Push it to global object and mark this as running
      window.jfTests.tests.push(this);
      this.isRunning = true;

      // Add apply function
      if (!!!options.apply) throw new Error("apply function must be provided");
      if (typeof options.apply != "function") throw new TypeError("apply must be a function");
      this.#apply = options.apply;

      // Define page match regex
      if (!!!options.pageMatch) throw new Error("pageMatch must be provided");
      const isRegex = options.pageMatch.constructor.name !== "RegExp";
      const isString = options.pageMatch.constructor.name !== "String";
      const isArray = options.pageMatch.constructor.name !== "Array";
      if (!isRegex && !isString && !isArray)
        throw new TypeError(
          "pageMatch must either be a RegExp match, or a string/array of strings to match the pathname"
        );
      this.#pageMatch = options.pageMatch;

      // Add reset function
      if (!!options.reset) {
        if (typeof options.reset != "function") throw new TypeError("reset must be a function");
        this.#reset = options.reset;
      }

      // Add style sheet
      if (!!options.style) {
        // console.log(typeof style);
        if (typeof options.style != "string") throw new TypeError("style must be a string");
        this.#style = options.style;
      }

      // Define whether we should watch for removal of an element to re-init
      if (!!options.watchForRemoval) {
        // check it's a string or an array
        checkIsSelector(options.watchForRemoval, "watchForRemoval");

        // At this point, we definitely have a string or an array of strings
        this.#watchForRemoval = options.watchForRemoval;
      }

      // Define whether we should remove elements on page change
      if (!!options.removeOnPageChange) {
        // check it's a string or an array
        checkIsSelector(options.removeOnPageChange, "removeOnPageChange");

        // At this point, we definitely have a string or an array of strings
        this.#removeOnPageChange = options.removeOnPageChange;
      }

      // Update maxLoopCount if provided (undocumented)
      if (!!options.maxLoopCount) {
        if (typeof options.maxLoopCount != "number") throw new TypeError("maxLoopCount must be a number");
        this.#maxLoopCount = options.maxLoopCount;
      }

      // Add our page change listener
      this.#bindPageChangeListener();

      // Add our main element removal listener
      this.#bindMainRemovalListener();

      // Bind an event to handle the page change
      console.log(`\t%cBinding Page Change`, "background: purple; color: #fff; padding: 2px 5px;");
      window.removeEventListener("wt-pagechange", this.#handlePageChange);
      window.addEventListener("wt-pagechange", this.#handlePageChange);
    } catch (e) {
      this.#error(e);
    }
  }

  /** Start the test */
  init = async () => {
    try {
      // If we have pageMatch, then check that first before we run anything
      if (!!this.#pageMatch) {
        // 1. Check if it's a regex string and use that
        if (typeof this.#pageMatch == "object" && this.#pageMatch.constructor.name == "RegExp") {
          const reg = this.#pageMatch as RegExp;
          const regex = new RegExp(reg, "gi");
          if (!regex.test(window.location.pathname)) {
            // Not the right page
            console.log(`%cPage not matched`, "background: red; color: #fff; padding: 2px 5px;");
            // If we have a reset function, run that
            this.#runReset();
            return;
          }
        }

        // 2. If it's not regex, then check it's a string and check the pathname matches the string
        if (typeof this.#pageMatch == "string") {
          if (window.location.pathname != this.#pageMatch) {
            // Not the right page
            console.log(`%cPage not matched`, "background: red; color: #fff; padding: 2px 5px;");
            // If we have a reset function, run that
            this.#runReset();
            return;
          }
        }

        // 3. Check if it's an array and then loop to check the pathname
        if (typeof this.#pageMatch == "object" && this.#pageMatch.constructor.name == "Array") {
          const matchedPage = (this.#pageMatch as string[]).find((selector) => window.location.pathname == selector);
          if (!matchedPage) {
            // Not the right page
            console.log(`%cPage not matched`, "background: red; color: #fff; padding: 2px 5px;");
            // If we have a reset function, run that
            this.#runReset();
            return;
          }
        }
      }

      console.log(`%cPage matched`, "background: #199bd7; color: #fff; padding: 2px 5px;");
      // Wait for the body to exist to avoid issues
      await waitForElement("body");
      this.#applyTest();
    } catch (e) {
      this.#error(e);
    }
  };

  #error = (e) => {
    console.warn(this.id, e);
    this.init = () => null;
  };

  #removeElements = async () => {
    try {
      // 1. If it's a string, just find that element and remove it
      if (typeof this.#removeOnPageChange == "string") {
        removeElementFromDOM(this.#removeOnPageChange);
      }

      // 2. Otherwise it must be an array, so we cycle each and remove
      if (typeof this.#removeOnPageChange == "object") {
        this.#removeOnPageChange.forEach((selector) => removeElementFromDOM(selector));
      }
    } catch (e) {
      this.#error(e);
    }
  };

  #handlePageChange = async () => {
    try {
      console.log(`%cPage changed`, "background: #199bd7; color: #fff; padding: 2px 5px;");
      this.#loopCount = 0; // Reset the loop counter
      if (!!this.#removeOnPageChange) await this.#removeElements();
      await this.init();
    } catch (e) {
      this.#error(e);
    }
  };

  #applyTest = () => {
    try {
      console.log(`%cApplying Test`, "background: #199bd7; color: #fff; padding: 2px 5px;");
      this.#insertStyleSheet();
      this.#bindWatchForRemoval();
      this.#apply();
    } catch (e) {
      this.#error(e);
    }
  };

  #bindWatchForRemoval = () => {
    // TODO: if we have an array, then get it as a list of strings
    try {
      if (!!!this.#watchForRemoval) return;
      console.log(`\t%cBinding Removal Watcher`, "background: purple; color: #fff; padding: 2px 5px;");

      // Create a new observer
      const observer = useMutationObserver(`${this.id}--removal`);

      // Abort if already bound
      if (observer.details.isObserving) return;

      // Bind it
      const target = document.querySelector("body");

      const config: MutationObserverInit = { childList: true, subtree: true };

      const callback: MutationCallback = (mutations) => {
        const checkNode = (node: Node, selector: string) => {
          // Check if the node matches the selector
          if ((node as Element)?.matches(selector)) {
            console.log(
              `%cElement ${selector} was removed, re-init`,
              "background: orange; color: #fff; padding: 2px 5px;"
            );
            if (this.#loopCount >= this.#maxLoopCount) {
              console.log(`%cMax loop count reached, aborting`, "background: red; color: #fff; padding: 2px 5px;");
              this.#runReset();
              return;
            }
            this.#loopCount += 1;
            this.init();
          }
        };

        mutations.forEach((mutation) => {
          try {
            if (mutation.removedNodes.length == 0) return;
            mutation.removedNodes.forEach(async (node) => {
              try {
                if (node.nodeType !== 1) return;
                // 1. if it's a string, just check it
                if (typeof this.#watchForRemoval == "string") checkNode(node, this.#watchForRemoval);

                // 2. if it's an array, loop and check them
                if (typeof this.#watchForRemoval == "object") {
                  this.#watchForRemoval.forEach((selector) => checkNode(node, selector));
                }
              } catch (e) {
                this.#error(e);
              }
            });
          } catch (e) {
            this.#error(e);
          }
        });
      };
      observer.observe(target, config, callback);
    } catch (e) {
      this.#error(e);
    }
  };

  #runReset = () => {
    console.log(`\t%cResetting Test`, "background: #199bd7; color: #fff; padding: 2px 5px;");
    // Remove the inserted stylesheet
    this.#removeStyleSheet();
    // Run the reset function
    if (!!this.#reset && typeof this.#reset == "function") this.#reset();
  };

  #insertStyleSheet = () => {
    try {
      // Abort if we don't have a stylesheet
      if (!!!this.#style) return;
      // Insert our stylesheet
      console.log(`\t%cInserting Stylesheet`, "background: purple; color: #fff; padding: 2px 5px;");
      insertStyle(this.#style, `${this.id}--style`);
    } catch (e) {
      this.#error(e);
    }
  };

  #removeStyleSheet = () => {
    try {
      document.querySelectorAll(`#${this.id}--style`).forEach((el) => el.remove());
    } catch (e) {
      this.#error(e);
    }
  };

  #bindMainRemovalListener = () => {
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
              if (node.nodeName !== "MAIN") return;
              // the MAIN element has been re-added, so re-init this test
              console.log(
                `%cMain element re-added, restarting test`,
                "background: green; color: #fff; padding: 2px 5px;"
              );
              await this.init();
            } catch (e) {
              this.#error(e);
            }
          });
        });
      };

      window.jfTests.reapplyListener = useMutationObserver("ReapplyListener");
      window.jfTests.reapplyListener.observe(target, config, callback);
    } catch (e) {
      this.#error(e);
    }
  };

  #bindPageChangeListener = () => {
    // Abort if we've already added this listener as we only need one
    if (!!window.jfTests.pageListener) return;
    // console.log(`%cSetting Page Change Listener`, "background: #199bd7; color: #fff; padding: 2px 5px;");
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
      this.#error(e);
    }
  };
}
