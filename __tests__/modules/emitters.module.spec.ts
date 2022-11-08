import { emitEvent, listenForSwipe } from "../../src";
import { JfExperiment, jfEvents } from "../../src/types/generic";

const THROW_MESSAGE = "Could not find global experiment information object";
const NO_VARIANT_THROW = "Variant is missing from global experiment information object";
const NO_TICKET_THROW = "Ticket ID is missing from global experiment information object";
const BAD_VARIANT_THROW = "Variant is invalid, it should be a single letter";
const BAD_TICKET_THROW = "Ticket ID is invalid it should follow the format: XXX_000000";
const BAD_TYPE_THROW = `Argument 1 can only be one of the following: ${jfEvents.join(", ")}`;
const CORRECT_TICKET = "TIK_000000";
const CORRECT_VARIANT = "A";
const BAD_TICKET = "nope";
const BAD_VARIANT = "nope";
const JF_EXPERIMENT_CORRECT = {
  ticketId: CORRECT_TICKET,
  variant: CORRECT_VARIANT,
};
const JF_EXPERIMENT_INCORRECT = {
  ticketId: BAD_TICKET,
  variant: BAD_VARIANT,
};
const MESSAGE = "Whoops";
const LEFT_CALLBACK = jest.fn();
const RIGHT_CALLBACK = jest.fn();

class PointerEvent extends MouseEvent {
  pointerType: string;
  clientX: number;
  constructor(type, { pointerType = "", ...MouseEventInit } = {}) {
    super(type, MouseEventInit);
    this.pointerType = pointerType;
    // continue with https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/PointerEvent#Arguments
    Object.defineProperty(this, "clientX", {
      writable: true,
    });
  }
}

describe("emitEvent", () => {
  const handleErr = (event: CustomEvent) => {
    expect(event.detail.variant).toBe(CORRECT_VARIANT);
    expect(event.detail.ticket).toBe(CORRECT_TICKET);
    expect(event.detail.message).toBe(MESSAGE);
  };
  const handleLoad = (event: CustomEvent) => {
    expect(event.detail.variant).toBe(CORRECT_VARIANT);
    expect(event.detail.ticket).toBe(CORRECT_TICKET);
  };
  const handleTrack = (event: CustomEvent) => {
    expect(event.detail.variant).toBe(CORRECT_VARIANT);
    expect(event.detail.ticket).toBe(CORRECT_TICKET);
  };

  afterEach(() => {
    window.removeEventListener("jf-wx-err", handleErr);
    window.removeEventListener("jf-wx-test", handleLoad);
    window.removeEventListener("jf-wx-track", handleTrack);
  });

  it("will throw an error if there is no fully formed jfExperiment object in the global scope", () => {
    // @ts-ignore
    expect(() => emitEvent("tits")).toThrow(BAD_TYPE_THROW);
    // @ts-ignore
    expect(() => emitEvent("load")).toThrow(THROW_MESSAGE);

    // @ts-ignore
    expect(() => emitEvent("load", { ticketId: CORRECT_TICKET })).toThrow(NO_VARIANT_THROW);

    // @ts-ignore
    expect(() => emitEvent("load", { variant: CORRECT_VARIANT })).toThrow(NO_TICKET_THROW);

    // @ts-ignore
    expect(() =>
      emitEvent("load", {
        variant: BAD_VARIANT,
        ticketId: CORRECT_TICKET,
      })
    ).toThrow(BAD_VARIANT_THROW);

    // @ts-ignore
    expect(() =>
      emitEvent("load", {
        ticketId: BAD_TICKET,
        variant: CORRECT_VARIANT,
      })
    ).toThrow(BAD_TICKET_THROW);
  });

  it("will dispatch the correct event with the correct detail", () => {
    jest.spyOn(console, "warn").mockImplementationOnce(() => {});
    // @ts-ignore
    emitEvent(
      "error",
      {
        ticketId: CORRECT_TICKET,
        variant: CORRECT_VARIANT,
      },
      MESSAGE
    );
    // @ts-ignore
    emitEvent("load", {
      ticketId: CORRECT_TICKET,
      variant: CORRECT_VARIANT,
    });
    // @ts-ignore
    emitEvent("track", {
      ticketId: CORRECT_TICKET,
      variant: CORRECT_VARIANT,
    });
  });
});

describe("listenForSwipe", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("will call the correct callback when the user swipes right", () => {
    const element = document.createElement("div");
    const pointerDown = new PointerEvent("pointerdown");
    const pointerUp = new PointerEvent("pointerup");
    pointerDown.clientX = 50;
    pointerUp.clientX = 100;
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(pointerDown);
    element.dispatchEvent(pointerUp);
    expect(RIGHT_CALLBACK).toBeCalledTimes(1);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
  });

  it("will call the correct callback when the user swipes left", () => {
    const element = document.createElement("div");
    const pointerDown = new PointerEvent("pointerdown");
    const pointerUp = new PointerEvent("pointerup");
    pointerDown.clientX = 100;
    pointerUp.clientX = 50;
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(pointerDown);
    element.dispatchEvent(pointerUp);
    expect(LEFT_CALLBACK).toBeCalledTimes(1);
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
  });

  it("will not fire a callback if the movement right is not over the 50px threshold", () => {
    const element = document.createElement("div");
    const pointerDown = new PointerEvent("pointerdown");
    const pointerUp = new PointerEvent("pointerup");
    pointerDown.clientX = 100;
    pointerUp.clientX = 80;
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(pointerDown);
    element.dispatchEvent(pointerUp);
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
  });

  it("will not fire a callback if the movement left is not over the 50px threshold", () => {
    const element = document.createElement("div");
    const pointerDown = new PointerEvent("pointerdown");
    const pointerUp = new PointerEvent("pointerup");
    pointerDown.clientX = 100;
    pointerUp.clientX = 80;
    listenForSwipe(element, LEFT_CALLBACK, RIGHT_CALLBACK);
    element.dispatchEvent(pointerDown);
    element.dispatchEvent(pointerUp);
    expect(RIGHT_CALLBACK).toBeCalledTimes(0);
    expect(LEFT_CALLBACK).toBeCalledTimes(0);
  });
});
