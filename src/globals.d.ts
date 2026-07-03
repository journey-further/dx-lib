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
  /** Active experiments, keyed by version */
  experiments?: {
    [version: string]: JfSPA[];
  };
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

/** Minimal shape retained for backward compatibility with window.jfTests */
export interface JfLegacyTest {
  id: string;
  isRunning: boolean;
}

/**
 * Global interface for managing tests
 *
 * @interface
 */
export interface JfTests {
  /** Array of active tests */
  tests: JfLegacyTest[];
  /** Observer for test reapplication */
  reapplyListener?: JfObserver;
  /** Observer for page changes */
  pageListener?: JfObserver;
  /** Current page path */
  pagePath?: string;
}

export interface NuxtInstance {
  $store?: Record<string, unknown>;
  $nextTick?: (callback?: () => void) => Promise<void>;
  [key: string]: unknown;
}

declare global {
  interface Window {
    jfLib: JfLib;
    jfTests: JfTests;
    $nuxt?: NuxtInstance;
  }
}

declare global {
  // Add 'ready' to an Element
  interface Element {
    jfReady?: string[];
    jfRemoved?: string[];
    jfUpdated?: string[];
  }
}
