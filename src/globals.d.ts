import { RBTest, JfSPA, JfObserver, JfObserverObject, JfReadyObject } from "./modules";

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
      callbacks: (JfReadyObject | null)[];
    };
  };
  /** Observer for element update events */
  elementUpdated?: {
    [version: string]: {
      observer: JfObserver;
      callbacks: (JfReadyObject | null)[];
    };
  };
  /** Current page path */
  pagePath?: string;
  /** Active experiments */
  experiments?: JfSPA[];
}

/**
 * Global interface for managing tests
 *
 * @interface
 */
export interface JfTests {
  /** Array of active tests */
  tests: RBTest[];
  /** Observer for test reapplication */
  reapplyListener?: JfObserver;
  /** Observer for page changes */
  pageListener?: JfObserver;
  /** Current page path */
  pagePath?: string;
}

declare global {
  interface Window {
    jfLib: JfLib;
    jfTests: JfTests;
    jfObservers: JfObserverObject[];
  }
}

declare global {
  // Add 'ready' to an Element
  interface Element {
    ready?: string[];
  }
}
