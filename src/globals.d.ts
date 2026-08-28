import { JfObserver, JfObserverObject, JfReadyObject, JfRemovedObject, JfSPA } from "./modules";
import { JfBusListener } from "./modules/customEvents";
import { JfUpdatedObject } from "./modules/elementUpdated";
import { JfListenerObject } from "./modules/useEventListener";
import { JfTimerObject } from "./modules/useSetTimeout";

/**
 * Global library interface for managing DOM observers and experiments
 *
 * @interface
 */
export interface JfLib {
  /** Observer for page change events */
  pageChange?: {
    [version: string]: {
      observer: JfObserver;
      /** Last seen full location (path + search + hash) — the comparison base for change detection */
      pagePath?: string;
    };
  };
  /** Observer for re-initialization events */
  reInit?: {
    [version: string]: {
      observer: JfObserver;
      /** Node names watched for re-addition — a shared registry so every instance's removedNode is honoured */
      nodeNames?: Set<string>;
    };
  };
  /** Observer for element ready events */
  elementReady?: {
    [version: string]: {
      observer: JfObserver;
      callbacks: (JfReadyObject | null)[];
    };
  };
  /** Observer for element removal events */
  elementRemoved?: {
    [version: string]: {
      observer: JfObserver;
      callbacks: (JfRemovedObject | null)[];
    };
  };
  /** Observer for element update events */
  elementUpdated?: {
    [version: string]: {
      observer: JfObserver;
      callbacks: (JfUpdatedObject | null)[];
    };
  };
  /**
   * Every test running on the page — deliberately flat and unversioned, so vendored copies of the lib at different
   * versions share one registry. Entries have mixed shapes across the estate; branch on `details.schema` before reading
   * anything beyond `details.id`.
   */
  experiments?: JfSPA[];
  /** MutationObservers tracked by useMutationObserver, keyed by version */
  observers?: {
    [version: string]: JfObserverObject[];
  };
  /** Event listeners tracked by useEventListener, keyed by version */
  listeners?: {
    [version: string]: JfListenerObject[];
  };
  /** Timers tracked by useSetTimeout, keyed by version */
  timers?: {
    [version: string]: JfTimerObject[];
  };
  /** Custom event buses, keyed by version then experiment ID */
  customEvents?: {
    [version: string]: {
      bus: EventTarget;
      /** Tracked subscriptions so teardown sweeps can remove an experiment's listeners */
      listeners: JfBusListener[];
    };
  };
}

export interface NuxtInstance {
  $store?: Record<string, unknown>;
  $nextTick?: (callback?: () => void) => Promise<void>;
  [key: string]: unknown;
}

/**
 * Nuxt 4's app instance (a Vue `nuxtApp`), as returned by `useNuxtApp()` or read off a mounted Vue app's
 * `globalProperties.$nuxt`. Untyped beyond `isHydrating` — the object also carries `hooks`, `payload`, `vueApp`, etc,
 * none of which waitForNuxtStable needs.
 */
export interface NuxtApp {
  isHydrating?: boolean;
  [key: string]: unknown;
}

/** The subset of Vue's app instance (`__vue_app__`) that waitForNuxtStable reads to reach a Nuxt 4 nuxtApp. */
export interface VueApp {
  config: {
    globalProperties: {
      $nuxt?: NuxtApp;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    jfLib: JfLib;
    /** GTM/analytics data layer written to by pushToDL */
    dataLayer: any[]; // eslint-disable-line
    $nuxt?: NuxtInstance;
    /**
     * Nuxt 4's composable for reaching the running nuxtApp. Not standard Nuxt behaviour — Nuxt auto-imports this at
     * build time rather than placing it on `window` — so its presence here is a side effect of how a given site is
     * built, not a guarantee. See waitForNuxtStable.
     */
    useNuxtApp?: () => NuxtApp;
  }

  // elementReady's per-element fired marks
  interface Element {
    jfReady?: string[];
    /** Vue's own app instance, set on the mount element. Private Vue internal, not a public API. */
    __vue_app__?: VueApp;
  }
}
