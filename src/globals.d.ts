import { JfObserver, JfObserverObject, JfReadyObject, JfRemovedObject, JfSPA } from "./modules";
import { JfUpdatedObject } from "./modules/elementUpdated";

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
  /** Current page path */
  pagePath?: string;
  /** Active experiments */
  experiments?: JfSPA[];
  /** Custom event buses, keyed by version then experiment ID */
  customEvents?: {
    [version: string]: {
      bus: EventTarget;
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
    jfObservers: JfObserverObject[];
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
