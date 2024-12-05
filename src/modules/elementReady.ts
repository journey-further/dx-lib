import { useMutationObserver } from "./useMutationObserver";
import { waitFor } from "./waitFor";

/**
 * TODO:
 *
 * - Update this to also write to the jfTests window object to create an `elementListener` observer.
 * - That observer should bind to the html, listen for ALL changes (and only listen once)
 * - We can then use that observer to check each time a new node is added to see whether it matches our ready state
 * - Use the "ready" binding on Element to determine if it's already been marked as ready
 * - We can then create an "unReady" or "elementRemoved" function that watches all "removedNodes" and matches against our
 *   "ready" state
 * - Push to array of elements to check: [{selector: ".some_class", id: "RAB_010996--ready"}]
 * - Then use the single mutation observer to check the array and run through to detect them on every change?
 * - Can check if an elementReady is already bound using that id
 * - Could also take an array of `selector`
 */

/**
 * Detects when an element matching a specific CSS selector is added to the DOM and executes a callback.
 *
 * This function monitors the DOM for elements matching the given selector. Once a matching element is found and
 * satisfies optional conditions, the callback function is executed. Each element is marked as "ready" after the
 * callback has run, preventing duplicate executions.
 *
 * @param {string} selector - A CSS selector string used to identify the target element. _(Required)_
 * @param {Function} callback - A function to execute when the element is found. Receives the element as its parameter.
 *   _(Required)_
 * @param {string} id - A unique identifier to track elements that have already triggered the callback. _(Required)_
 * @param {Function} conditions - Optional conditions to validate the element before triggering the callback. Must be a
 *   function that returns `true` for the callback to execute.
 */

export const elementReady = (
  selector: string,
  callback: (el: Element) => void,
  id: string,
  conditions = (el: Element) => !!el
) => {
  if (!!!selector) {
    throw new Error("No selector provided");
  }

  if (!!!callback || typeof callback !== "function") {
    throw new Error("Callback is not defined");
  }

  if (!!!id) {
    throw new Error("No id provided");
  }

  const loopDom = () => {
    const targets = document.querySelectorAll(selector);
    targets.forEach((target) => {
      // if it's already been marked as ready, then skip this
      if (!!target.ready && typeof target.ready == "object" && target.ready.includes(id)) return;

      // check if it also matches the conditions
      if (conditions(target) !== true) return;

      // mark it as ready
      target.ready = target.ready || [];
      target.ready.push(id);

      // then run our callback
      callback(target);
    });
  };

  const bindObserver = async () => {
    try {
      // NOTE: we need to wait for the body to definitely exist, otherwise we may get errors
      await waitFor(() => !!document.body);
      const observer = useMutationObserver(id);
      observer.observe(document.body, { childList: true, subtree: true }, loopDom);
    } catch (error) {
      console.error(error);
    }
  };

  // 1. loop the dom initially to find any that already exist
  loopDom();

  // 2. bind an MO to listen for any future changes

  bindObserver();
};
