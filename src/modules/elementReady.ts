import { generateId } from "./generateId";
import { useMutationObserver } from "./useMutationObserver";

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
  id = generateId(),
  conditions = (el: Element) => !!el
) => {
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

  // 1. loop the dom initially to find any that already exist
  loopDom();

  // 2. bind an MO to listen for any future changes
  const observer = useMutationObserver(id);
  observer.observe(document.body, { childList: true, subtree: true }, loopDom);
};
