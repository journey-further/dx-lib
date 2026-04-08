import { emitEvent, jfEvents } from "../../src";

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
const MESSAGE = "Whoops";

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

  beforeEach(() => {
    vi.clearAllMocks();
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
    vi.spyOn(console, "warn").mockImplementationOnce(() => {});
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

  it("will log the stack trace and error cause if an error object is passed to it", () => {
    vi.spyOn(console, "warn").mockImplementationOnce(() => {});
    emitEvent(
      "error",
      {
        ticketId: CORRECT_TICKET,
        variant: CORRECT_VARIANT,
      },
      new Error(MESSAGE, { cause: "Your mum" })
    );

    expect(console.warn).toBeCalledTimes(3);
  });
});
