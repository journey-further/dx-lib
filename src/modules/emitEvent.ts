export const jfEvents = ["load", "error", "track"] as const;
export const isJfEvent = (event: JfEvent): event is JfEvent => jfEvents.includes(event);
/** A type union for JF Events */
export type JfEvent = typeof jfEvents[number];

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
export const emitEvent = (type: JfEvent, experiment: JfExperiment, msg?: string) => {
  if (!isJfEvent(type)) throw new Error(`Argument 1 can only be one of the following: ${jfEvents.join(", ")}`);
  // eslint-disable-next-line no-undef
  if (typeof experiment === "undefined") throw new Error("Could not find global experiment information object");
  if (!experiment?.variant) throw new Error("Variant is missing from global experiment information object");
  if (!/^(?:[A-Z]|CONTROL)$/.test(experiment.variant))
    throw new Error("Variant is invalid, it should be a single letter or 'CONTROL'");
  if (!experiment?.ticketId) throw new Error("Ticket ID is missing from global experiment information object");
  if (!/^[A-Z0-9]{3}_[0-9]{6}$/.test(experiment.ticketId))
    throw new Error("Ticket ID is invalid it should follow the format: XXX_000000");

  if (type === "error") {
    // eslint-disable-next-line no-undef
    console.warn(`${experiment.ticketId}: ${msg}`);
    window.dispatchEvent(
      new CustomEvent("jf-wx-err", {
        detail: {
          // eslint-disable-next-line no-undef
          ticket: experiment.ticketId,
          message: msg,
          // eslint-disable-next-line no-undef
          variant: experiment.variant,
        },
      })
    );
  }
  if (type === "load") {
    window.dispatchEvent(
      new CustomEvent("jf-wx-test", {
        detail: {
          // eslint-disable-next-line no-undef
          ticket: experiment.ticketId,
          // eslint-disable-next-line no-undef
          variant: experiment.variant,
        },
      })
    );
  }
  if (type === "track") {
    window.dispatchEvent(
      new CustomEvent("jf-wx-track", {
        detail: {
          // eslint-disable-next-line no-undef
          ticket: experiment.ticketId,
          // eslint-disable-next-line no-undef
          variant: experiment.variant,
        },
      })
    );
  }
};
