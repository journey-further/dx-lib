import { createLogger } from "../helpers";

/**
 * Queries the DOM for a single element, logging a debug-gated "not found" message when there is no match.
 *
 * Replaces the common query → log → bail boilerplate in experiment builds: the returned value is `null` when nothing
 * matches, and the miss is already logged (visible only with the `jf_debug=true` cookie), so the caller just checks
 * the return value.
 *
 * @param {string} selector - The CSS selector used to find the element.
 * @param {string} label - Identifies the caller in the log output, e.g. `"TIK_123456 hero"`.
 * @param {ParentNode} [root=document] - The node to query within. Defaults to `document`.
 * @returns {HTMLElement | null} The matching element, or `null` if none was found.
 *
 * @example
 *   const hero = getElement(".jumbotron", "TIK_123456 hero");
 *   if (!hero) return;
 */
export const getElement = (selector: string, label: string, root: ParentNode = document): HTMLElement | null => {
  const elem = root.querySelector<HTMLElement>(selector);
  if (!elem) createLogger(`[${label}] getElement`)(`not found: ${selector}`, "warn");
  return elem;
};
