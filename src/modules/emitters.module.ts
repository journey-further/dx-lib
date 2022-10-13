import { isJfEvent, JfEvent, jfEvents } from "../types/generic";

export const emitEvent = (type: JfEvent, msg?: string) => {
  if (!isJfEvent(type)) throw new Error(`Argument 1 can only be one of the following: ${jfEvents.join(", ")}`);
  // eslint-disable-next-line no-undef
  if (typeof jfExperiment === "undefined") throw new Error("Could not find global experiment information object");
  if (!jfExperiment?.variant) throw new Error("Variant is missing from global experiment information object");
  if (!/^[A-Z]$/.test(jfExperiment.variant)) throw new Error("Variant is invalid, it should be a single letter");

  if (!jfExperiment?.ticketId) throw new Error("Ticket ID is missing from global experiment information object");
  if (!/^[A-Z]{3}_[0-9]{6}$/.test(jfExperiment.ticketId))
    throw new Error("Ticket ID is invalid it should follow the format: XXX_000000");

  if (type === "error") {
    // eslint-disable-next-line no-undef
    console.warn(`${jfExperiment.ticketId}: ${msg}`);
    window.dispatchEvent(
      new CustomEvent("jf-wx-err", {
        detail: {
          // eslint-disable-next-line no-undef
          ticket: jfExperiment.ticketId,
          message: msg,
          // eslint-disable-next-line no-undef
          variant: jfExperiment.variant,
        },
      })
    );
  }
  if (type === "load") {
    window.dispatchEvent(
      new CustomEvent("jf-wx-test", {
        detail: {
          // eslint-disable-next-line no-undef
          ticket: jfExperiment.ticketId,
          // eslint-disable-next-line no-undef
          variant: jfExperiment.variant,
        },
      })
    );
  }
};
