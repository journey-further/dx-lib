import { jfEvents } from "./constants";

declare global {
  interface Window {
    dataLayer: any[]; // eslint-disable-line
    jfObservers: JfObserverObject[];
  }
}

/** Journey Further Experiment information */
export interface JfExperiment {
  ticketId: string;
  variant: string;
}

/** An object with key/value pairs relating to time measurements */
export type ParsedTimeObject = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

/** A type union for JF Events */
export type JfEvent = typeof jfEvents[number];

/** A simple function with args */
export type FunctionWithArgs = (...args: unknown[]) => void;

/** An object with information relating to a mutation observer applied by useMutationObserver */
export interface JfObserverObject {
  observer: MutationObserver | undefined;
  isObserving: boolean;
  ticketId: string;
}

/** Wrapper for the observe function in the mutation observer api */
export type JfObserveFunction = (target: Node, config: MutationObserverInit, callback: MutationCallback) => boolean;

/** The object returned by the useMutationObserver function */
export interface JfObserver {
  details: JfObserverObject;
  disconnect: () => void;
  observe: JfObserveFunction;
}
