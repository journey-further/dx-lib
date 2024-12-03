import { RBTest, JfSPA, JfObserver, JfObserverObject } from "./modules";

declare global {
  interface Window {
    // Add RBTest/SPA to the Window object
    jfTests: {
      tests: (RBTest | JfSPA)[];
      reapplyListener?: JfObserver;
      pageListener?: JfObserver;
      elementListener?: JfObserver;
      pagePath?: string;
    };
    // jfObservers object
    jfObservers: JfObserverObject[];
  }
  // Add 'ready' to an Element
  interface Element {
    ready: string[] | null;
  }
}
