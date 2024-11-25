export const jfEvents = ["load", "error", "track"] as const;
export const isJfEvent = (event: JfEvent): event is JfEvent => jfEvents.includes(event);
/**
 * A type representing the possible values of Journey Further (JF) events.
 *
 * This type is a union of all possible event names defined in the `jfEvents` array. It ensures that only valid event
 * names can be used in code where this type is applied.
 */
export type JfEvent = (typeof jfEvents)[number];

/**
 * Represents the details of a Journey Further (JF) experiment.
 *
 * This interface provides the essential information required to identify and manage an experiment.
 *
 * Example:
 *
 * ```javascript
 * const jfExperiment = {
 *   ticketId: "ABC_123456",
 *   variant: "A",
 * };
 * ```
 *
 * @property {string} ticketId - A unique identifier for the experiment ticket
 * @property {string} variant - The variant of the experiment
 */
export interface JfExperiment {
  ticketId: string;
  variant: string;
}

/**
 * Emits an event related to a Journey Further experiment for monitoring and debugging purposes.
 *
 * This function communicates with the canary testing tool by dispatching custom events to the global scope. It supports
 * events for test lifecycle states, such as "load", "error", and "track", and validates experiment data before emitting
 * events. Errors and issues are logged to the console with detailed information if applicable.
 *
 * @param {JfEvent} type - The type of event to emit. Must be one of "load", "error", or "track".
 * @param {JfExperiment} experiment - The experiment details, including the ticket ID and variant information.
 * @param {string | Error} [err] - An error message or object, used when emitting an "error" event.
 */

export const emitEvent = (type: JfEvent, experiment: JfExperiment, err?: string | Error) => {
  if (!isJfEvent(type)) throw new Error(`Argument 1 can only be one of the following: ${jfEvents.join(", ")}`);

  if (typeof experiment === "undefined") throw new Error("Could not find global experiment information object");
  if (!experiment?.variant) throw new Error("Variant is missing from global experiment information object");
  if (!/^(?:[A-Z]|CONTROL)$/.test(experiment.variant))
    throw new Error("Variant is invalid, it should be a single letter or 'CONTROL'");
  if (!experiment?.ticketId) throw new Error("Ticket ID is missing from global experiment information object");
  if (!/^[A-Z0-9]{3}_[0-9]{6}$/.test(experiment.ticketId))
    throw new Error("Ticket ID is invalid it should follow the format: XXX_000000");

  if (type === "error") {
    console.warn(`${experiment.ticketId}: ${typeof err === "string" ? err : err.message}`);

    // if we have an error object reveal the stack trace
    if (err instanceof Error && err.stack) {
      console.warn(err.stack);
    }
    // reveal the cause
    if (err instanceof Error && err.cause) {
      console.warn(`The above error had the following cause: ${JSON.stringify(err.cause)}`);
    }

    window.dispatchEvent(
      new CustomEvent("jf-wx-err", {
        detail: {
          ticket: experiment.ticketId,
          message: typeof err === "string" ? err : err.message,
          errorObject: err instanceof Error ? err : undefined,

          variant: experiment.variant,
        },
      })
    );
  }
  if (type === "load") {
    window.dispatchEvent(
      new CustomEvent("jf-wx-test", {
        detail: {
          ticket: experiment.ticketId,

          variant: experiment.variant,
        },
      })
    );
  }
  if (type === "track") {
    window.dispatchEvent(
      new CustomEvent("jf-wx-track", {
        detail: {
          ticket: experiment.ticketId,

          variant: experiment.variant,
        },
      })
    );
  }
};
