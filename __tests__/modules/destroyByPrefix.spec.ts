import { destroyByPrefix } from "../../src/modules/destroyByPrefix";
import { elementReady } from "../../src/modules/elementReady";
import { customEvents } from "../../src/modules/customEvents";
import { useEventListener } from "../../src/modules/useEventListener";
import { useSetTimeout } from "../../src/modules/useSetTimeout";
import { useMutationObserver } from "../../src/modules/useMutationObserver";

const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));

describe("destroyByPrefix", () => {
  beforeEach(() => {
    window.jfLib?.observers?.["1.0"]?.forEach((o) => o.observer?.disconnect());
    // @ts-expect-error test cleanup
    delete window.jfLib;
    document.body.innerHTML = "";
  });

  it("removes prefixed element* callbacks, clears jfReady marks, and disconnects the shared observer at zero callbacks", async () => {
    const el = document.createElement("div");
    el.className = "target";
    document.body.appendChild(el);

    const cb = vi.fn();
    elementReady(".target", cb, "OWN_000001--decorate");
    await tick(60);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(el.jfReady).toContain("OWN_000001--decorate");

    destroyByPrefix("OWN_000001");

    expect(el.jfReady).not.toContain("OWN_000001--decorate");
    expect(window.jfLib.elementReady?.["1.0"]).toBeUndefined(); // entry dropped at zero callbacks
    expect(window.jfLib.observers["1.0"].find((o) => o.ticketId === "elementReady--1.0")).toBeUndefined();
  });

  it("leaves other owners' callbacks and their shared observer alone", async () => {
    const mine = vi.fn();
    const theirs = vi.fn();
    elementReady(".a", mine, "OWN_000002--a");
    elementReady(".b", theirs, "OWN_999999--b");

    destroyByPrefix("OWN_000002");

    expect(window.jfLib.elementReady["1.0"].callbacks.map((c) => c?.id)).toEqual(["OWN_999999--b"]);
    expect(window.jfLib.observers["1.0"].find((o) => o.ticketId === "elementReady--1.0")).toBeDefined();
  });

  it("removes the owner's customEvents listeners (exact owner id, no prefix)", () => {
    const handler = vi.fn();
    const other = vi.fn();
    const bus = customEvents("OWN_000003");
    const otherBus = customEvents("OWN_888888");
    bus.on("thing:happened", handler);
    otherBus.on("thing:happened", other);

    destroyByPrefix("OWN_000003");

    bus.emit("thing:happened", {});
    otherBus.emit("thing:happened", {});
    expect(handler).not.toHaveBeenCalled();
    expect(other).toHaveBeenCalledTimes(1);
  });

  it("disconnects prefixed listeners, timers and observers", async () => {
    const el = document.createElement("button");
    document.body.appendChild(el);
    const clickHandler = vi.fn();
    const timerHandler = vi.fn();
    useEventListener("OWN_000004--click", el, "click", clickHandler);
    useSetTimeout(timerHandler, 50, "OWN_000004--timer");
    const obs = useMutationObserver("OWN_000004--observer");
    obs.observe(document.body, { childList: true }, () => {});

    destroyByPrefix("OWN_000004");

    el.click();
    await tick(80);
    expect(clickHandler).not.toHaveBeenCalled();
    expect(timerHandler).not.toHaveBeenCalled();
    expect(window.jfLib.listeners["1.0"]).toHaveLength(0);
    expect(window.jfLib.timers["1.0"]).toHaveLength(0);
    expect(window.jfLib.observers["1.0"].find((o) => o.ticketId === "OWN_000004--observer")).toBeUndefined();
  });

  it("is a safe no-op with no registries or a bad owner id", () => {
    expect(() => destroyByPrefix("OWN_000005")).not.toThrow();
    expect(() => destroyByPrefix("")).not.toThrow();
    // @ts-expect-error deliberate bad input
    expect(() => destroyByPrefix(undefined)).not.toThrow();
  });
});
