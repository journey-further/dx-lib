import { RBTest, JfSPA, JfObserver, JfObserverObject, ReadyObject } from "./modules";

/**
 * FIXME:
 *
 * - If we use versioning, we'll end up with multiple events firing. If those events don't also change, then they'll be
 *   picked up by all tests - e.g. wt-pagechange will fire TWICE if there are 2 versions of the pageChange observer
 * - We'll either need to version the events we dispatch, or find a simpler way
 */

declare global {
  interface Window {
    jfLib: {
      pageChange?: {
        [version: string]: {
          observer: JfObserver;
        };
      };
      reInit?: {
        [version: string]: {
          observer: JfObserver;
        };
      };
      elementReady?: {
        [version: string]: {
          observer: JfObserver;
          callbacks: (ReadyObject | null)[];
        };
      };
      // elementRemoved?: {
      //   [version: string]: {
      //     observer: JfObserver;
      //     callbacks: unknown[];
      //   };
      // }[];
      // elementUpdated?: {
      //   [version: string]: {
      //     observer: JfObserver;
      //     callbacks: unknown[];
      //   };
      // }[];
      pagePath?: string;
      experiments?: JfSPA[];
    };
  }
}

declare global {
  interface Window {
    // jfObservers object
    jfObservers: JfObserverObject[];
  }
}

declare global {
  interface Window {
    // Add RBTest to the Window object
    jfTests: {
      tests: RBTest[];
      reapplyListener?: JfObserver;
      pageListener?: JfObserver;
      pagePath?: string;
    };
  }
}

declare global {
  // Add 'ready' to an Element
  interface Element {
    ready: string[] | null;
  }
  interface Node {
    ready: string[] | null;
  }
}
