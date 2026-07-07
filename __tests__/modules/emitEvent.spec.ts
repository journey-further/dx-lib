import { emitEvent, jfEvents } from "../../src";

const CORRECT_TICKET = "TIK_000000";
const CORRECT_VARIANT = "A";
const BAD_TICKET = "nope";
const BAD_VARIANT = "nope";
const MESSAGE = "Whoops";

const capture = (name: string) => {
  const events: CustomEvent[] = [];
  const handler = (event: Event) => events.push(event as CustomEvent);
  window.addEventListener(name, handler);
  return { events, dispose: () => window.removeEventListener(name, handler) };
};

describe("emitEvent", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dispatches jf-test-1.0 and legacy jf-wx-test for a 'test' event", () => {
    const modern = capture("jf-test-1.0");
    const legacy = capture("jf-wx-test");

    emitEvent("test", { ticketId: CORRECT_TICKET, variant: CORRECT_VARIANT });

    for (const { events } of [modern, legacy]) {
      expect(events).toHaveLength(1);
      expect(events[0].detail).toEqual({ ticket: CORRECT_TICKET, variant: CORRECT_VARIANT });
    }
    modern.dispose();
    legacy.dispose();
  });

  it("dispatches jf-track-1.0 and legacy jf-wx-track for a 'track' event", () => {
    const modern = capture("jf-track-1.0");
    const legacy = capture("jf-wx-track");

    emitEvent("track", { ticketId: CORRECT_TICKET, variant: CORRECT_VARIANT });

    for (const { events } of [modern, legacy]) {
      expect(events).toHaveLength(1);
      expect(events[0].detail).toEqual({ ticket: CORRECT_TICKET, variant: CORRECT_VARIANT });
    }
    modern.dispose();
    legacy.dispose();
  });

  it("dispatches jf-err-1.0 and legacy jf-wx-err for an 'error' event", () => {
    const modern = capture("jf-err-1.0");
    const legacy = capture("jf-wx-err");

    emitEvent("error", { ticketId: CORRECT_TICKET, variant: CORRECT_VARIANT }, MESSAGE);

    for (const { events } of [modern, legacy]) {
      expect(events).toHaveLength(1);
      expect(events[0].detail.ticket).toBe(CORRECT_TICKET);
      expect(events[0].detail.variant).toBe(CORRECT_VARIANT);
      expect(events[0].detail.message).toBe(MESSAGE);
    }
    modern.dispose();
    legacy.dispose();
  });

  it("throws a coded JfError for an unknown event type", () => {
    // @ts-expect-error deliberately invalid type
    expect(() => emitEvent("tits", { ticketId: CORRECT_TICKET, variant: CORRECT_VARIANT })).toThrow(
      expect.objectContaining({ name: "JfError", code: "INVALID_TYPE" })
    );
  });

  it("no longer accepts the old 'load' API word", () => {
    expect(jfEvents).not.toContain("load");
    // @ts-expect-error "load" was renamed to "test"
    expect(() => emitEvent("load", { ticketId: CORRECT_TICKET, variant: CORRECT_VARIANT })).toThrow(
      expect.objectContaining({ name: "JfError", code: "INVALID_TYPE" })
    );
  });

  it("throws coded JfErrors for missing or malformed experiment data on test/track", () => {
    // @ts-expect-error missing experiment
    expect(() => emitEvent("test")).toThrow(expect.objectContaining({ name: "JfError", code: "MISSING_OPTION" }));
    // @ts-expect-error missing variant
    expect(() => emitEvent("test", { ticketId: CORRECT_TICKET })).toThrow(
      expect.objectContaining({ name: "JfError", code: "MISSING_OPTION" })
    );
    // @ts-expect-error missing ticketId
    expect(() => emitEvent("test", { variant: CORRECT_VARIANT })).toThrow(
      expect.objectContaining({ name: "JfError", code: "MISSING_OPTION" })
    );
    expect(() => emitEvent("track", { ticketId: CORRECT_TICKET, variant: BAD_VARIANT })).toThrow(
      expect.objectContaining({ name: "JfError", code: "INVALID_OPTIONS" })
    );
    expect(() => emitEvent("track", { ticketId: BAD_TICKET, variant: CORRECT_VARIANT })).toThrow(
      expect.objectContaining({ name: "JfError", code: "INVALID_OPTIONS" })
    );
  });

  // H1: the error path must never throw — the reporter cannot be allowed to destroy the report
  it("never throws on the error path: malformed experiment still dispatches with malformed flag", () => {
    const modern = capture("jf-err-1.0");

    expect(() => emitEvent("error", { ticketId: BAD_TICKET, variant: CORRECT_VARIANT }, MESSAGE)).not.toThrow();

    expect(modern.events).toHaveLength(1);
    expect(modern.events[0].detail.ticket).toBe(BAD_TICKET);
    expect(modern.events[0].detail.message).toBe(MESSAGE);
    expect(modern.events[0].detail.malformed).toBe(true);
    modern.dispose();
  });

  it("never throws on the error path: missing experiment entirely", () => {
    const modern = capture("jf-err-1.0");

    // @ts-expect-error missing experiment
    expect(() => emitEvent("error", undefined, MESSAGE)).not.toThrow();

    expect(modern.events).toHaveLength(1);
    expect(modern.events[0].detail.message).toBe(MESSAGE);
    expect(modern.events[0].detail.malformed).toBe(true);
    modern.dispose();
  });

  it("never throws on the error path: omitted err argument reports 'unknown error'", () => {
    const modern = capture("jf-err-1.0");

    expect(() => emitEvent("error", { ticketId: CORRECT_TICKET, variant: CORRECT_VARIANT })).not.toThrow();

    expect(modern.events).toHaveLength(1);
    expect(modern.events[0].detail.ticket).toBe(CORRECT_TICKET);
    expect(modern.events[0].detail.message).toBe("unknown error");
    modern.dispose();
  });

  it("logs the stack trace and error cause when an Error object is passed", () => {
    emitEvent(
      "error",
      { ticketId: CORRECT_TICKET, variant: CORRECT_VARIANT },
      new Error(MESSAGE, { cause: "Your mum" })
    );

    const calls = (console.warn as ReturnType<typeof vi.fn>).mock.calls.flat().join("\n");
    expect(calls).toContain(MESSAGE);
    expect(calls).toContain("cause");
  });
});
