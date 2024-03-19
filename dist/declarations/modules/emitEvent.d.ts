export declare const jfEvents: readonly ["load", "error", "track"];
export declare const isJfEvent: (event: JfEvent) => event is "track" | "load" | "error";
/** A type union for JF Events */
export type JfEvent = (typeof jfEvents)[number];
/** Journey Further Experiment information */
export interface JfExperiment {
    ticketId: string;
    variant: string;
}
/**
 * Emit an event related to the JF ticket object which is in the global scope. Used to let the canary testing tool know
 * if a test has fired or failed.
 *
 * @param type The event which is to be emitted
 * @param experiment The experiment object
 * @param err The message to emit in the case of an error or an error object
 */
export declare const emitEvent: (type: JfEvent, experiment: JfExperiment, err?: string | Error) => void;
//# sourceMappingURL=emitEvent.d.ts.map