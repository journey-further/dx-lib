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

export const jfEvents = ["load", "error"] as const;
export type JfEvent = typeof jfEvents[number];
export const isJfEvent = (event: JfEvent): event is JfEvent => jfEvents.includes(event);
// eslint-disable-next-line
export type FunctionWithArgs = (...args: any[]) => void;
