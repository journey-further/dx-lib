/**
 * Waits for a Nuxt SPA (2, 3 or 4) to finish its initial render cycle before resolving.
 *
 * Nuxt 2/3 sites publish a global `window.$nuxt` carrying a Vuex `$store`; readiness there is the store existing. Nuxt
 * 4 drops both `window.$nuxt` and `window.__NUXT__`, moves state to Pinia, and exposes its app instance (the "nuxtApp")
 * only via the `useNuxtApp()` composable — which itself is not guaranteed to be reachable as `window.useNuxtApp`; Nuxt
 * auto-imports it at build time rather than placing it on `window`, so a site that does not expose it there falls back
 * to reading Vue's own `__vue_app__` internal off the `#__nuxt` mount element (a private API, so this fallback is a
 * safety net, not the primary path). On Nuxt 4, readiness is that nuxtApp's `isHydrating` being explicitly `false` —
 * `undefined` is not treated as ready, since some Nuxt builds never set the flag at all and an unset flag says nothing
 * about hydration state.
 *
 * Whichever signal (Vuex store, or nuxtApp hydration) becomes true first wins; a given site will only ever satisfy one
 * of the two, so both are checked on every poll.
 *
 * Once ready, drains Vue's reactive render queue via `$nextTick` (if the resolved app instance exposes one — Nuxt 4's
 * nuxtApp does not), then flushes pending browser paint cycles with a double `requestAnimationFrame`. The rAF phase is
 * skipped when `document.visibilityState` is `"hidden"`, since rAF callbacks are suspended in backgrounded/prerendered
 * tabs and would otherwise hang this promise forever.
 *
 * Prevents injected DOM mutations from firing before the page has finished rendering, which can block the render cycle
 * and cause fatal errors.
 *
 * @param {number} [maxTries=50] - Maximum poll attempts waiting for Nuxt to initialise. Default is `50`, i.e. 5s at
 *   the default 100ms interval — measured hydration on a live Nuxt 4 site (Toolstation, PDP) completed at ~3.4s, so
 *   this leaves comfortable headroom over the old 2s budget, which was silently expiring before hydration finished.
 * @param {number} [timeout=100] - Milliseconds between poll attempts. Default is `100`
 * @returns {Promise<boolean>} Resolves to `true` when stable, `false` if Nuxt did not initialise within the timeout (a
 *   warning is logged in this case) or if `$nextTick` rejects (double-rAF still fires in either case, unless the tab is
 *   hidden)
 */

import { waitFor } from "./waitFor";

export const waitForNuxtStable = async (maxTries = 50, timeout = 100): Promise<boolean> => {
  // Holds whichever app-like object actually reported ready, so the $nextTick phase below can use it.
  // Typed loosely (both NuxtInstance and NuxtApp are effectively string-keyed bags) rather than as a
  // union, since neither declares $nextTick strongly enough for the union to type-check on its own.
  let readySource: Record<string, unknown> | undefined;

  const resolveNuxtApp = () =>
    // window.useNuxtApp is NOT standard Nuxt behaviour: Nuxt auto-imports this composable at build
    // time and does not normally place it on `window`. Where it is there, it's a side effect of a
    // given site's build config and could disappear without notice.
    window.useNuxtApp?.() ??
    // Private Vue internal, present on the Nuxt mount element. Safety net for when the composable
    // above isn't exposed globally, not the primary path.
    document.querySelector("#__nuxt")?.__vue_app__?.config?.globalProperties?.$nuxt;

  const ready = await waitFor(
    () => {
      const nuxtApp = resolveNuxtApp();
      // Only an explicit `false` counts as hydrated — `isHydrating` can legitimately be `undefined` on
      // some Nuxt builds, and that says nothing about whether hydration has finished.
      if (nuxtApp?.isHydrating === false) {
        readySource = nuxtApp;
        return true;
      }
      if (window?.$nuxt?.$store) {
        readySource = window.$nuxt;
        return true;
      }
      return false;
    },
    maxTries,
    timeout
  );

  if (!ready) {
    console.warn("[waitForNuxtStable] timed out waiting for Nuxt to become stable; resolving false");
  }

  // Let Vue drain its render queue before we touch the DOM (no-op if $nextTick is absent — Nuxt 4's
  // nuxtApp does not expose one). A rejecting $nextTick (e.g. a Vue render error) must not break the
  // documented boolean contract.
  if (ready && typeof readySource?.$nextTick === "function") {
    try {
      await (readySource.$nextTick as () => Promise<void>)();
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
