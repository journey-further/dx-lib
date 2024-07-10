import { insertStyle } from "./insertStyle";
import { JfObserver, useMutationObserver } from "./useMutationObserver";
import { waitForElement } from "./waitForElement";

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

// declare global window.jfTests = {}

/** Class framework to create a test structure on Russell & Bromley */
export class RBTest {
  isRunning = false;

  #apply: () => void;

  #reset: () => void | null = null;

  #style: string | null = null;

  #listenForPageChange = true;

  #watchForRemoval: string | null;

  #pageRegex: RegExp;

  #loopCount = 0;

  id: string;

  /**
   * Class framework to create a test structure on Russell & Bromley
   *
   * @param id Campaign ID
   * @param options Options for Test setup
   * @param options.apply The function to apply when the test runs (required)
   * @param options.reset Function to run that will reset the test (optional)
   * @param options.style Stylesheet to insert (optional)
   * @param options.pageRegex Regex condition to check we're on the right page (required)
   * @param options.watchForRemoval Selector of element to watch for removal and re-apply (optional)
   */
  constructor(
    id: string,
    options: {
      apply: () => void;
      reset?: () => void;
      style?: string;
      pageRegex: RegExp;
      watchForRemoval?: string;
    }
  ) {
    try {
      if (!!!id) throw new Error("You must provide a Test ID");
      this.id = id;

      window.jfTests = window.jfTests || { tests: [] };
      this.isRunning = !!window.jfTests.tests.find((test) => test.id == id);
      if (this.isRunning) {
        console.log(`‼️ %cTest ${id} already setup`, "background: orange; color: #fff; padding: 2px 5px;");
        // change our init function so it does nothing as this version of the test doesn't need to run
        this.init = () => null;
        return;
      }

      console.log(`🛠️ %cCreate RB Test: ${id}`, "background: green; color: #fff; padding: 2px 5px;");

      // Push it to global object and mark this as running
      window.jfTests.tests.push(this);
      this.isRunning = true;

      // Add apply function
      if (!!!options.apply) throw new Error("apply function must be provided");
      if (typeof options.apply != "function") throw new Error("apply must be a function");
      this.#apply = options.apply;

      // Define page match regex
      if (!!!options.pageRegex) throw new Error("pageRegex must be provided");
      if (options.pageRegex.constructor.name !== "RegExp") throw new Error("pageRegex must be a RegExp string");
      this.#pageRegex = options.pageRegex;

      // Add reset function
      if (!!options.reset) {
        if (typeof options.reset != "function") throw new Error("reset must be a function");
        this.#reset = options.reset;
      }

      // Add style sheet
      if (!!options.style) {
        // console.log(typeof style);
        // if (typeof options.style != "string") throw new Error("style must be a string");
        this.#style = options.style;
      }

      // // Define whether this test should check page changes (default: true)
      // if (options.listenForPageChange !== null) {
      //   this.#listenForPageChange = !!options.listenForPageChange;
      // }

      // Define whether we should watch for removal of an element to re-init
      if (!!options.watchForRemoval) {
        // TODO: maybe update to object if we have any more options?
        if (typeof options.watchForRemoval != "string") throw new Error("watchForRemoval must be a string");

        this.#watchForRemoval = options.watchForRemoval;
      }

      // Add our page change listener
      this.#bindPageChangeListener();

      // Add our main element removal listener
      this.#bindMainRemovalListener();

      // Bind an event to handle the page change
      console.log(`\t➕ %cBinding Page Change`, "background: purple; color: #fff; padding: 2px 5px;");
      window.removeEventListener("wt-pagechange", this.#handlePageChange);
      window.addEventListener("wt-pagechange", this.#handlePageChange);
    } catch (e) {
      this.#error(e);
    }
  }

  /** Start the test */
  init = async () => {
    try {
      // If we have pageRegex, then check that first before we run anything
      if (!!this.#pageRegex) {
        const regex = new RegExp(this.#pageRegex, "gi");
        if (!regex.test(window.location.pathname)) {
          // Not the right page
          console.log(`❌ %cPage not matched`, "background: red; color: #fff; padding: 2px 5px;");
          // If we have a reset function, run that
          // TODO: also remove stylesheet
          this.#runReset();
          return;
        }
      }

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

  #handlePageChange = async () => {
    try {
      console.log(`🔁 %cPage changed`, "background: #199bd7; color: #fff; padding: 2px 5px;");
      await this.init();
    } catch (e) {
      this.#error(e);
    }
  };

  #applyTest = () => {
    try {
      console.log(`✅ %cApplying Test`, "background: #199bd7; color: #fff; padding: 2px 5px;");
      this.#insertStyleSheet();
      this.#bindWatchForRemoval();
      this.#apply();
    } catch (e) {
      this.#error(e);
    }
  };

  #bindWatchForRemoval = () => {
    try {
      if (!!!this.#watchForRemoval) return;
      console.log(`\t➕ %cBinding Removal Watcher`, "background: purple; color: #fff; padding: 2px 5px;");

      // Create a new observer
      const observer = useMutationObserver(`_${this.id}_`);

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
                // Clean up the string
                const match = this.#watchForRemoval.replace(/^(\.|#)/, "");
                // Check if it's an id or not
                const isId = /^#/.test(this.#watchForRemoval);
                let isMatched = false;
                // If it's an id and the removed node matches

                if (isId && (node as Element)?.id == match) isMatched = true;
                // If it's a class and the removed node matches
                if (!isId && (node as Element)?.classList.contains(match)) isMatched = true;
                // If we have a match, re-init
                if (isMatched) {
                  console.log(
                    `🗑️ %cElement was removed, re-init`,
                    "background: orange; color: #fff; padding: 2px 5px;"
                  );
                  if (this.#loopCount >= 5) {
                    console.log(
                      `❌ %cMax loop count reached, aborting`,
                      "background: red; color: #fff; padding: 2px 5px;"
                    );
                    this.#runReset();
                    return;
                  }
                  this.#loopCount += 1;
                  await this.init();
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
    console.log(`\t🔄 %cResetting Test`, "background: #199bd7; color: #fff; padding: 2px 5px;");
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
      console.log(`\t➕ %cInserting Stylesheet`, "background: purple; color: #fff; padding: 2px 5px;");
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
