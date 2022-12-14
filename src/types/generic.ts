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

export const jfEvents = ["load", "error", "track"] as const;
export type JfEvent = typeof jfEvents[number];
export const isJfEvent = (event: JfEvent): event is JfEvent => jfEvents.includes(event);
// eslint-disable-next-line
export type FunctionWithArgs = (...args: any[]) => void;

export interface JfObserverObject {
  observer: MutationObserver | undefined;
  isObserving: boolean;
  ticketId: string;
}

export type JfObserveFunction = (target: Node, config: MutationObserverInit, callback: MutationCallback) => void;

export interface JfObserver extends JfObserverObject {
  disconnect: () => void;
  observe: JfObserveFunction;
}
