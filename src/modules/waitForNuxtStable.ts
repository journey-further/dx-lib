/**
 * Waits for a Nuxt 2 SPA to finish its initial render cycle before resolving.
 *
 * Polls for the Vuex store to initialise, then drains Vue's reactive render queue via `$nextTick`
 * (if available), then flushes pending browser paint cycles with a double `requestAnimationFrame`.
 * The rAF phase is skipped when `document.visibilityState` is `"hidden"`, since rAF callbacks are
 * suspended in backgrounded/prerendered tabs and would otherwise hang this promise forever.
 *
 * Prevents injected DOM mutations from firing before the page has finished rendering, which can
 * block the render cycle and cause fatal errors.
 *
 * @param {number} [maxTries=20] - Maximum poll attempts waiting for Nuxt to initialise. Default is `20`
 * @param {number} [timeout=100] - Milliseconds between poll attempts. Default is `100`
 * @returns {Promise<boolean>} Resolves to `true` when stable, `false` if Nuxt did not initialise
 *   within the timeout (a warning is logged in this case) or if `$nextTick` rejects (double-rAF
 *   still fires in either case, unless the tab is hidden)
 */

import { waitFor } from "./waitFor";

export const waitForNuxtStable = async (maxTries = 20, timeout = 100): Promise<boolean> => {
  const ready = await waitFor(() => !!window?.$nuxt?.$store, maxTries, timeout);

  if (!ready) {
    console.warn("[waitForNuxtStable] timed out waiting for window.$nuxt.$store; resolving false");
  }

  // Let Vue drain its render queue before we touch the DOM (no-op if $nextTick is absent). A rejecting
  // $nextTick (e.g. a Vue render error) must not break the documented boolean contract.
  if (ready && typeof window.$nuxt?.$nextTick === "function") {
    try {
      await window.$nuxt.$nextTick();
    } catch {
      // Fall through to the rAF phase regardless.
    }
  }

  // Flush pending browser paint cycles - skipped in hidden/backgrounded tabs, where rAF is suspended
  // and would otherwise hang this promise forever.
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return !!ready;
  }

  return new Promise<boolean>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve(!!ready));
    });
  });
};
