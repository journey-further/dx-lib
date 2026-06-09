import { customEvents } from "../../src";

const ID_A = "TIK_000001";
const ID_B = "TIK_000002";

describe("customEvents", () => {
  beforeEach(() => {
    // Reset the shared bus between tests
    delete window.jfLib?.customEvents;
  });

  it("initialises window.jfLib.customEvents on first call", () => {
    customEvents(ID_A);
    expect(window.jfLib.customEvents?.["1.0"]?.bus).toBeInstanceOf(EventTarget);
  });

  it("reuses the same bus across multiple calls", () => {
    const busA = (() => { customEvents(ID_A); return window.jfLib.customEvents?.["1.0"]?.bus; })();
    const busB = (() => { customEvents(ID_B); return window.jfLib.customEvents?.["1.0"]?.bus; })();
    expect(busA).toBe(busB);
  });

  describe("emit and on", () => {
    it("delivers detail to handler", () => {
      const { emit, on } = customEvents(ID_A);
      const handler = jest.fn();
      on("test:event", handler);
      emit("test:event", { foo: "bar" });
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ foo: "bar" });
    });

    it("defaults detail to empty object when not provided", () => {
      const { emit, on } = customEvents(ID_A);
      const handler = jest.fn();
      on("test:event", handler);
      emit("test:event");
      expect(handler).toHaveBeenCalledWith({});
    });

    it("does not deliver events to a different experiment's listener", () => {
      const a = customEvents(ID_A);
      const b = customEvents(ID_B);
      const handlerB = jest.fn();
      b.on("test:event", handlerB);
      a.emit("test:event", { from: "A" });
      expect(handlerB).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribe", () => {
    it("stops receiving events after calling the returned function", () => {
      const { emit, on } = customEvents(ID_A);
      const handler = jest.fn();
      const unsubscribe = on("test:event", handler);
      unsubscribe();
      emit("test:event", { foo: "bar" });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("cross-experiment listening", () => {
    it("allows listening to another experiment's events via fromId", () => {
      const a = customEvents(ID_A);
      const b = customEvents(ID_B);
      const handler = jest.fn();
      // B listens to A's events
      b.on("hotel:selected", handler, ID_A);
      a.emit("hotel:selected", { hotelId: "latimer-estate" });
      expect(handler).toHaveBeenCalledWith({ hotelId: "latimer-estate" });
    });

    it("does not receive its own events when listening cross-experiment", () => {
      const a = customEvents(ID_A);
      const b = customEvents(ID_B);
      const handler = jest.fn();
      b.on("hotel:selected", handler, ID_A);
      // B emits — should NOT trigger the cross-listener pointed at A
      b.emit("hotel:selected", { hotelId: "should-not-arrive" });
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
