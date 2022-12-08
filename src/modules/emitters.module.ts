import { FunctionWithArgs, isJfEvent, JfEvent, jfEvents, JfExperiment } from "types/generic";

/**
 * Emit an event related to the JF ticket object which is in the global scope. Used to let the canary testing tool know
 * if a test has fired or failed.
 *
 * @param {JfEvent} type The event which is to be emitted
 * @param {JfExperiment} experiment The experiment object
 * @param {string} msg The message to emit in the case of an error
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

/**
 * Watch an element for user swipe gestures and fire the correct callback depending which direction the user swiped
 *
 * @param {HTMLElement} element The element we want to watch for swipes on
 * @param {FunctionWithArgs} leftCallback The callback to execute when the user swipes left
 * @param {FunctionWithArgs} rightCallback The callback to execute when the user swipes right
 */
export const listenForSwipe = (element: Element, leftCallback: FunctionWithArgs, rightCallback: FunctionWithArgs) => {
  let touchStart: number;
  let initialTouch: number;
  let touchEnd: number;
  let touching = false;

  const resetTouch = () => {
    touchEnd = undefined;
    touching = false;
    initialTouch = undefined;
    touchStart = undefined;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length < 1) return;
    touchEnd = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = initialTouch && touchEnd ? initialTouch - touchEnd : 0;

    // the user moved less that 50px so open nav or link
    if (diff <= -50) {
      rightCallback();
    } else if (diff >= 50) {
      leftCallback();
    }
    resetTouch();
    element.removeEventListener("touchmove", handleTouchMove);
    element.removeEventListener("touchend", handleTouchEnd);
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (touching) return;
    touching = true;
    initialTouch = e?.touches[0]?.clientX;
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchmove", handleTouchMove);
  };

  const handlePointerUp = (event: MouseEvent) => {
    if (touchStart - event.clientX <= -50) {
      rightCallback();
    } else if (touchStart - event.clientX >= 50) {
      leftCallback();
    }
    resetTouch();
    element.removeEventListener("pointerup", handlePointerUp);
  };

  const handlePointerDown = (event: MouseEvent) => {
    if (touching) return;
    touching = true;
    touchStart = event.clientX;
    element.addEventListener("pointerup", handlePointerUp, { capture: true });
  };

  element.addEventListener("pointerdown", handlePointerDown);
  element.addEventListener("touchstart", handleTouchStart);
};
