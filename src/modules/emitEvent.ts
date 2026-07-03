import { jfError, JfErrorInstance } from "../helpers/jfError";
import { reportError } from "../helpers/reportError";

export const jfEvents = ["test", "error", "track"] as const;
export const isJfEvent = (event: JfEvent): event is JfEvent => jfEvents.includes(event);
/**
 * A type representing the possible values of Journey Further (JF) events.
 *
 * This type is a union of all possible event names defined in the `jfEvents` array. It ensures that only valid event
 * names can be used in code where this type is applied.
 */
export type JfEvent = (typeof jfEvents)[number];

/** Versioned wire event dispatched for a `"test"` emit, matching the `jf-pagechange-1.0` family */
export const TEST_EVENT = "jf-test-1.0";
/** Versioned wire event dispatched for a `"track"` emit */
export const TRACK_EVENT = "jf-track-1.0";
/** @deprecated Legacy wire name, dual-dispatched for one deprecation window. Removed next major. */
export const LEGACY_TEST_EVENT = "jf-wx-test";
/** @deprecated Legacy wire name, dual-dispatched for one deprecation window. Removed next major. */
export const LEGACY_TRACK_EVENT = "jf-wx-track";

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

const validateExperiment = (experiment?: JfExperiment): JfErrorInstance | null => {
  if (typeof experiment === "undefined")
    return jfError("MISSING_OPTION", "Could not find global experiment information object");
  if (!experiment?.variant)
    return jfError("MISSING_OPTION", "Variant is missing from global experiment information object");
  if (!/^(?:[A-Z]|CONTROL)$/.test(experiment.variant))
    return jfError("INVALID_OPTIONS", "Variant is invalid, it should be a single letter or 'CONTROL'");
  if (!experiment?.ticketId)
    return jfError("MISSING_OPTION", "Ticket ID is missing from global experiment information object");
  if (!/^[A-Z0-9]{3}_[0-9]{6}$/.test(experiment.ticketId))
    return jfError("INVALID_OPTIONS", "Ticket ID is invalid it should follow the format: XXX_000000");
  return null;
};

/**
 * Emits an event related to a Journey Further experiment for monitoring and debugging purposes.
 *
 * Dispatches versioned custom events to the global scope — `jf-test-1.0`, `jf-track-1.0`, and (via the library's
 * error reporter) `jf-err-1.0` — alongside the deprecated legacy `jf-wx-*` names for one deprecation window.
 *
 * `"test"` and `"track"` calls validate the experiment data and throw a coded `JfError` on failure. `"error"` calls
 * NEVER throw: malformed experiment data is reported best-effort with a `malformed: true` flag in the event detail,
 * so the error channel cannot destroy the report it carries.
 *
 * @param {JfEvent} type - The type of event to emit. Must be one of "test", "error", or "track".
 * @param {JfExperiment} experiment - The experiment details, including the ticket ID and variant information.
 * @param {string | Error} [err] - An error message or object, used when emitting an "error" event.
 */
export const emitEvent = (type: JfEvent, experiment: JfExperiment, err?: string | Error) => {
  if (type === "error") {
    const problem = validateExperiment(experiment);
    if (problem) {
      try {
        console.warn(`emitEvent: ${problem.message}`);
      } catch {
        // the error path must never throw
      }
    }
    reportError(experiment?.ticketId || "unknown", err ?? "unknown error", {
      variant: experiment?.variant,
      ...(problem ? { malformed: true } : {}),
    });
    return;
  }

  if (!isJfEvent(type))
    throw jfError("INVALID_TYPE", `Argument 1 can only be one of the following: ${jfEvents.join(", ")}`);

  const problem = validateExperiment(experiment);
  if (problem) throw problem;

  const detail = { ticket: experiment.ticketId, variant: experiment.variant };
  const [event, legacyEvent] = type === "test" ? [TEST_EVENT, LEGACY_TEST_EVENT] : [TRACK_EVENT, LEGACY_TRACK_EVENT];
  window.dispatchEvent(new CustomEvent(event, { detail }));
  window.dispatchEvent(new CustomEvent(legacyEvent, { detail }));
};
