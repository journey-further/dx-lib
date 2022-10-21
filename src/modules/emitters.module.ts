import { FunctionWithArgs, isJfEvent, JfEvent, jfEvents, JfExperiment } from "../types/generic";

declare const jfExperiment: JfExperiment;

/**
 * Emit an event related to the JF ticket object which is in the global scope. Used to let the canary testing tool know
 * if a test has fired or failed.
 *
 * @param {JfEvent} type The event which is to be emitted
 * @param {string} msg The message to emit in the case of an error
 */
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

/**
 * Watch an element for user swipe gestures and fire the correct callback depending which direction the user swiped
 *
 * @param {HTMLElement} element The element we want to watch for swipes on
 * @param {FunctionWithArgs} leftCallback The callback to execute when the user swipes left
 * @param {FunctionWithArgs} rightCallback The callback to execute when the user swipes right
 */
export const listenForSwipe = (element: Element, leftCallback: FunctionWithArgs, rightCallback: FunctionWithArgs) => {
  let touchStart: number;
  const handlePointerUp = (event: MouseEvent) => {
    if (touchStart - event.clientX <= -50) {
      rightCallback();
    } else if (touchStart - event.clientX >= 50) {
      leftCallback(event);
    }
    element.removeEventListener("pointerup", handlePointerUp, { capture: true });
  };

  const handlePointerDown = (event: MouseEvent) => {
    touchStart = event.clientX;
    element.addEventListener("pointerup", handlePointerUp, { capture: true });
  };

  element.addEventListener("pointerdown", handlePointerDown, { capture: true });
};
