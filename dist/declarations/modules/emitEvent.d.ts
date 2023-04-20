export declare const jfEvents: readonly ["load", "error", "track"];
export declare const isJfEvent: (event: JfEvent) => event is "track" | "load" | "error";
/** A type union for JF Events */
export type JfEvent = (typeof jfEvents)[number];
/** Journey Further Experiment information */
interface JfExperiment {
    ticketId: string;
    variant: string;
}
/**
 * Emit an event related to the JF ticket object which is in the global scope. Used to let the canary testing tool know
 * if a test has fired or failed.
 *
 * @param type The event which is to be emitted
 * @param experiment The experiment object
 * @param msg The message to emit in the case of an error
 */
export declare const emitEvent: (type: JfEvent, experiment: JfExperiment, msg?: string) => void;
export {};
//# sourceMappingURL=emitEvent.d.ts.map