import { jfEvents } from "./constants";

declare global {
  interface Window {
    dataLayer: any[]; // eslint-disable-line
    jfObservers: JfObserverObject[];
  }
}

export interface JfExperiment {
  ticketId: string;
  variant: string;
}

export type ParsedTimeObject = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export type JfEvent = typeof jfEvents[number];
// eslint-disable-next-line
export type FunctionWithArgs = (...args: any[]) => void;

export interface JfObserverObject {
  observer: MutationObserver | undefined;
  isObserving: boolean;
  ticketId: string;
}

export type JfObserveFunction = (target: Node, config: MutationObserverInit, callback: MutationCallback) => boolean;

export interface JfObserver {
  details: JfObserverObject;
  disconnect: () => void;
  observe: JfObserveFunction;
}
