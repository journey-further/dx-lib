/**
 * Waits for a Nuxt 2 SPA to finish its initial render cycle before resolving.
 *
 * Polls for the Vuex store to initialise, then drains Vue's reactive render queue via `$nextTick`
 * (if available), then flushes pending browser paint cycles with a double `requestAnimationFrame`.
 *
 * Prevents injected DOM mutations from firing before the page has finished rendering, which can
 * block the render cycle and cause fatal errors.
 *
 * @param {number} [maxTries=20] - Maximum poll attempts waiting for Nuxt to initialise. Default is `20`
 * @param {number} [timeout=100] - Milliseconds between poll attempts. Default is `100`
 * @returns {Promise<boolean>} Resolves to `true` when stable, `false` if Nuxt did not initialise
 *   within the timeout (double-rAF still fires in either case)
 */

import { waitFor } from "./waitFor";

export const waitForNuxtStable = async (maxTries = 20, timeout = 100): Promise<boolean> => {
  const ready = await waitFor(() => !!window?.$nuxt?.$store, maxTries, timeout);

  // Let Vue drain its render queue before we touch the DOM (no-op if $nextTick is absent).
  if (ready && typeof window.$nuxt?.$nextTick === "function") {
    await window.$nuxt.$nextTick();
  }

  // Flush pending browser paint cycles.
  return new Promise<boolean>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve(!!ready));
    });
  });
};
