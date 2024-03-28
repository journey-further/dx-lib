import { useMutationObserver } from "./useMutationObserver";
import { waitFor } from "./waitFor";

declare global {
  interface Element {
    ready: string[] | null;
  }
}

/**
 * Detect when an element has been added to the DOM
 *
 * @param selector A CSS selector to find the element
 * @param callback Callback to run when the element is found
 * @param id Unique identifier for this function
 * @param conditions Extra conditions to check (must return true to fire callback)
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
      return;
    } catch (error) {
      console.error(error);
    }
  };

  // 1. loop the dom initially to find any that already exist
  loopDom();

  // 2. bind an MO to listen for any future changes
  // eslint-disable-next-line
  bindObserver();

  // stupid fucking commit messages
};
