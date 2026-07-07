import type { Mock } from "vitest";
import { useSPA } from "../../src";
import { JfSPAOptions } from "../../src/modules/useSPA";
import { JfLib } from "../../src/globals";

// Mock Error constructor (must use `function` — arrow fns are not constructable in Vitest 4)
const originalError = globalThis.Error;
global.Error = Object.assign(
  vi.fn(function (message?: string, options?: ErrorOptions) {
    return new originalError(message, options);
  }),
  { captureStackTrace: vi.fn(), stackTraceLimit: 10 }
) as unknown as typeof Error;

describe("useSPA", () => {
  const TEST_ID = "TEST_SPA";
  let defaultOptions: JfSPAOptions;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";

    // Setup window.jfLib with required observers
    window.jfLib = {
      experiments: { "1.0": [] },
      pageChange: {
        "1.0": {
          observer: {
            details: {
              observer: new MutationObserver(() => {}),
              isObserving: false,
              ticketId: "pageChange--1.0",
            },
            observe: vi.fn().mockReturnValue(true),
            disconnect: vi.fn(),
          },
          pagePath: "/test",
        },
      },
      reInit: {
        "1.0": {
          observer: {
            details: {
              observer: new MutationObserver(() => {}),
              isObserving: false,
              ticketId: "reInit--1.0",
            },
            observe: vi.fn().mockReturnValue(true),
            disconnect: vi.fn(),
          },
        },
      },
    } as JfLib;

    // Setup default options
    defaultOptions = {
      apply: vi.fn(),
      location: "/test",
    };

    // Mock window location
    delete window.location;
    window.location = {
      pathname: "/test",
      search: "",
      hash: "",
    } as Location;
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.clearAllTimers();
  });

  it("should initialize with valid options", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    expect(window.jfLib.experiments["1.0"]).toHaveLength(1);
  });

  it("should not initialize with invalid test ID", async () => {
    const spa = useSPA("");
    await expect(spa.init(defaultOptions)).rejects.toThrow();
  });

  it("should match string location pattern", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init({ ...defaultOptions, location: "/test" });
    expect(defaultOptions.apply).toHaveBeenCalled();
  });

  it("should match regex location pattern", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init({ ...defaultOptions, location: /test/ });
    expect(defaultOptions.apply).toHaveBeenCalled();
  });

  it("should not match incorrect location", async () => {
    window.location.pathname = "/no-match";
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    expect(defaultOptions.apply).not.toHaveBeenCalled();
  });

  it("should handle screen size conditions", async () => {
    window.innerWidth = 1500;
    const spa = useSPA(TEST_ID);

    await spa.init({
      ...defaultOptions,
      screen: { minWidth: 1000, maxWidth: 2000 },
    });

    expect(defaultOptions.apply).toHaveBeenCalled();
  });

  // it("should reset when screen size conditions not met", async () => {
  //   window.innerWidth = 1500;
  //   const spa = useSPA(TEST_ID);
  //   const reset = vi.fn();

  //   await spa.init({
  //     ...defaultOptions,
  //     screen: { minWidth: 1000, maxWidth: 2000 },
  //     reset,
  //   });

  //   // Trigger resize event and wait for debounce
  //   await new Promise((resolve) => setTimeout(resolve, 250));
  //   window = Object.assign(window, { innerWidth: 500 });
  //   window.dispatchEvent(new Event("resize"));
  //   await new Promise((resolve) => setTimeout(resolve, 250));

  //   expect(reset).toHaveBeenCalled();
  // });

  it("should cleanup on destroy", async () => {
    const spa = useSPA(TEST_ID);

    // Initialize first
    await spa.init(defaultOptions);

    // Add experiment with correct structure
    window.jfLib.experiments = {
      "1.0": [
        {
          details: { id: TEST_ID, isRunning: true },
          options: defaultOptions,
          loopCount: 0,
        } as any,
      ],
    };

    spa.destroy();
    expect(window.jfLib.experiments["1.0"]).toHaveLength(0);
  });

  it("should execute reset function", async () => {
    const reset = vi.fn();
    const spa = useSPA(TEST_ID);

    await spa.init({
      ...defaultOptions,
      reset,
    });

    spa.reset();
    expect(reset).toHaveBeenCalled();
  });

  // #99 — enhanced details
  it("should set details.pageMatched when page matches", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    expect(spa.details.pageMatched).toBe(true);
  });

  it("should set details.isApplied after apply runs", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    expect(spa.details.isApplied).toBe(true);
  });

  it("should set details.isReset and clear isApplied after reset runs", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    await spa.reset();
    expect(spa.details.isReset).toBe(true);
    expect(spa.details.isApplied).toBe(false);
    expect(spa.details.pageMatched).toBe(false);
  });

  it("should not set details.pageMatched when page does not match", async () => {
    window.location.pathname = "/no-match";
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    expect(spa.details.pageMatched).toBe(false);
  });

  // #105 — public API in jfLib.experiments
  it("should expose public API in jfLib.experiments", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    const exp = window.jfLib.experiments["1.0"][0];
    expect(typeof exp.init).toBe("function");
    expect(typeof exp.reset).toBe("function");
    expect(typeof exp.destroy).toBe("function");
    expect(exp.details.id).toBe(TEST_ID);
  });

  it("should allow calling reset on the experiment from jfLib.experiments", async () => {
    const reset = vi.fn();
    useSPA(TEST_ID);
    // Re-init with a different id since TEST_ID is now registered
    const spa = useSPA(`${TEST_ID}_2`);
    await spa.init({ ...defaultOptions, reset });
    await window.jfLib.experiments["1.0"][0].reset();
    expect(reset).toHaveBeenCalled();
  });

  // #107 — observer cleanup on reset
  it("should clean up elementReady callbacks with test ID prefix on reset", async () => {
    window.jfLib.elementReady = {
      "1.0": {
        observer: { details: { observer: new MutationObserver(() => {}), isObserving: false, ticketId: "er-1.0" }, observe: vi.fn(), disconnect: vi.fn() },
        callbacks: [
          { id: `${TEST_ID}--my-element`, callback: vi.fn() },
          { id: "OTHER_TEST--some-element", callback: vi.fn() },
        ],
      },
    };
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    await spa.reset();
    expect(window.jfLib.elementReady["1.0"].callbacks).toHaveLength(1);
    expect(window.jfLib.elementReady["1.0"].callbacks[0].id).toBe("OTHER_TEST--some-element");
  });

  it("should not remove callbacks from other tests with a similar ID prefix", async () => {
    window.jfLib.elementReady = {
      "1.0": {
        observer: { details: { observer: new MutationObserver(() => {}), isObserving: false, ticketId: "er-1.0" }, observe: vi.fn(), disconnect: vi.fn() },
        callbacks: [
          { id: `${TEST_ID}--element`, callback: vi.fn() },
          { id: `${TEST_ID}_EXTRA--element`, callback: vi.fn() },
        ],
      },
    };
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    await spa.reset();
    // TEST_ID_EXTRA--element should NOT be removed (different prefix)
    expect(window.jfLib.elementReady["1.0"].callbacks).toHaveLength(1);
    expect(window.jfLib.elementReady["1.0"].callbacks[0].id).toBe(`${TEST_ID}_EXTRA--element`);
  });

  describe("screen size handling", () => {
    let originalDispatchEvent: typeof window.dispatchEvent;
    let originalAddEventListener: typeof window.addEventListener;
    let resizeCallback: (e: Event) => void;

    beforeEach(() => {
      // Store original window methods
      originalDispatchEvent = window.dispatchEvent;
      originalAddEventListener = window.addEventListener;

      // Set initial window width
      window.innerWidth = 1024;

      // Mock addEventListener to capture resize callback
      window.addEventListener = vi.fn((event, callback) => {
        if (event === "resize") {
          resizeCallback = callback as (e: Event) => void;
        }
        return originalAddEventListener.call(window, event, callback);
      });

      // Mock dispatchEvent to actually trigger the callback
      window.dispatchEvent = vi.fn((event) => {
        if (event.type === "resize" && resizeCallback) {
          resizeCallback(event);
        }
        return true;
      });
    });

    afterEach(() => {
      // Restore original window methods
      window.dispatchEvent = originalDispatchEvent;
      window.addEventListener = originalAddEventListener;
    });

    it("should initialize when screen width is within bounds", async () => {
      const spa = useSPA(TEST_ID);
      await spa.init({
        ...defaultOptions,
        screen: { minWidth: 768, maxWidth: 1200 },
      });

      expect(defaultOptions.apply).toHaveBeenCalled();
    });

    it("should not initialize when screen width is below minWidth", async () => {
      window.innerWidth = 500;
      const spa = useSPA(TEST_ID);

      await spa.init({
        ...defaultOptions,
        screen: { minWidth: 768, maxWidth: 1200 },
      });

      expect(defaultOptions.apply).not.toHaveBeenCalled();
    });

    it("should not initialize when screen width is above maxWidth", async () => {
      window.innerWidth = 1500;
      const spa = useSPA(TEST_ID);

      await spa.init({
        ...defaultOptions,
        screen: { minWidth: 768, maxWidth: 1200 },
      });

      expect(defaultOptions.apply).not.toHaveBeenCalled();
    });

    it("should reset when window resizes below minWidth", async () => {
      const reset = vi.fn();
      const spa = useSPA(TEST_ID);

      // Start with valid width
      window.innerWidth = 1024;

      await spa.init({
        ...defaultOptions,
        screen: { minWidth: 768, maxWidth: 1200 },
        reset,
      });

      // Clear any initial calls
      reset.mockClear();
      (defaultOptions.apply as Mock).mockClear();

      // Simulate resize to smaller width
      window.innerWidth = 500;
      window.dispatchEvent(new Event("resize"));

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(reset).toHaveBeenCalled();
      expect(defaultOptions.apply).not.toHaveBeenCalled(); // Should not reapply when outside bounds
    });

    it("should reset when window resizes above maxWidth", async () => {
      const reset = vi.fn();
      const spa = useSPA(TEST_ID);

      // Start with valid width
      window.innerWidth = 1024;

      await spa.init({
        ...defaultOptions,
        screen: { minWidth: 768, maxWidth: 1200 },
        reset,
      });

      // Clear any initial calls
      reset.mockClear();
      (defaultOptions.apply as Mock).mockClear();

      // Simulate resize to larger width
      window.innerWidth = 1500;
      window.dispatchEvent(new Event("resize"));

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(reset).toHaveBeenCalled();
      expect(defaultOptions.apply).not.toHaveBeenCalled(); // Should not reapply when outside bounds
    });

    it("should reapply when window resizes back within bounds", async () => {
      const reset = vi.fn();
      const spa = useSPA(TEST_ID);

      // Start with valid width
      window.innerWidth = 1024;

      await spa.init({
        ...defaultOptions,
        screen: { minWidth: 768, maxWidth: 1200 },
        reset,
      });

      // Clear initial apply call
      (defaultOptions.apply as Mock).mockClear();

      // Simulate resize outside bounds
      window.innerWidth = 1500;
      window.dispatchEvent(new Event("resize"));

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Clear any calls from first resize
      (defaultOptions.apply as Mock).mockClear();

      // Simulate resize back within bounds
      window.innerWidth = 1000;
      window.dispatchEvent(new Event("resize"));

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(defaultOptions.apply).toHaveBeenCalled(); // Should reapply when back in bounds
    });

    it("should work with only minWidth specified", async () => {
      const spa = useSPA(TEST_ID);

      await spa.init({
        ...defaultOptions,
        screen: { minWidth: 768 },
      });

      expect(defaultOptions.apply).toHaveBeenCalled();
    });

    it("should work with only maxWidth specified", async () => {
      const spa = useSPA(TEST_ID);

      await spa.init({
        ...defaultOptions,
        screen: { maxWidth: 1200 },
      });

      expect(defaultOptions.apply).toHaveBeenCalled();
    });
  });

  describe("option validation errors", () => {
    it("throws when location is missing", async () => {
      const spa = useSPA(TEST_ID);
      await expect(spa.init({ apply: vi.fn() } as any)).rejects.toThrow();
    });

    it("throws when apply is not a function", async () => {
      const spa = useSPA(TEST_ID);
      await expect(spa.init({ apply: "not-a-function" as any, location: "/test" })).rejects.toThrow();
    });

    it("throws when location is an invalid type", async () => {
      const spa = useSPA(TEST_ID);
      await expect(spa.init({ apply: vi.fn(), location: 123 as any })).rejects.toThrow();
    });

    it("throws when location object is missing match", async () => {
      const spa = useSPA(TEST_ID);
      await expect(spa.init({ apply: vi.fn(), location: { match: "" } as any })).rejects.toThrow();
    });

    it("throws when location.type is invalid", async () => {
      const spa = useSPA(TEST_ID);
      await expect(
        spa.init({ apply: vi.fn(), location: { match: "/test", type: "invalid" as any } })
      ).rejects.toThrow();
    });

    it("throws when location.condition is not a function", async () => {
      const spa = useSPA(TEST_ID);
      await expect(
        spa.init({ apply: vi.fn(), location: { match: "/test", condition: "bad" as any } })
      ).rejects.toThrow();
    });

    it("throws when location.timeout is not a number", async () => {
      const spa = useSPA(TEST_ID);
      await expect(
        spa.init({ apply: vi.fn(), location: { match: "/test", timeout: "bad" as any } })
      ).rejects.toThrow();
    });

    it("throws when reset is not a function", async () => {
      const spa = useSPA(TEST_ID);
      await expect(spa.init({ ...defaultOptions, reset: "not-a-function" as any })).rejects.toThrow();
    });

    it("throws when watchForRemoval is not a string or array", async () => {
      const spa = useSPA(TEST_ID);
      await expect(spa.init({ ...defaultOptions, watchForRemoval: 123 as any })).rejects.toThrow();
    });

    it("throws when removeOnPageChange is not a string or array", async () => {
      const spa = useSPA(TEST_ID);
      await expect(spa.init({ ...defaultOptions, removeOnPageChange: 123 as any })).rejects.toThrow();
    });

    it("throws when removedNode is not a string", async () => {
      const spa = useSPA(TEST_ID);
      await expect(spa.init({ ...defaultOptions, removedNode: 123 as any })).rejects.toThrow();
    });

    it("throws when screen has neither minWidth nor maxWidth", async () => {
      const spa = useSPA(TEST_ID);
      await expect(spa.init({ ...defaultOptions, screen: {} as any })).rejects.toThrow();
    });
  });

  describe("location types", () => {
    it("matches one of multiple string paths in an array", async () => {
      const apply = vi.fn();
      const spa = useSPA(TEST_ID);
      await spa.init({ apply, location: ["/other", "/test"] });
      expect(apply).toHaveBeenCalled();
    });

    it("does not apply when none of array paths match", async () => {
      const apply = vi.fn();
      const spa = useSPA(TEST_ID);
      await spa.init({ apply, location: ["/no", "/match"] });
      expect(apply).not.toHaveBeenCalled();
    });

    it("matches using location object with custom type", async () => {
      (window.location as any).hostname = "localhost";
      const apply = vi.fn();
      const spa = useSPA(TEST_ID);
      await spa.init({ apply, location: { match: "localhost", type: "hostname" } });
      expect(apply).toHaveBeenCalled();
    });

    it("matches using location object with array match", async () => {
      const apply = vi.fn();
      const spa = useSPA(TEST_ID);
      await spa.init({ apply, location: { match: ["/other", "/test"] } });
      expect(apply).toHaveBeenCalled();
    });

    it("applies when location condition is satisfied", async () => {
      const apply = vi.fn();
      const spa = useSPA(TEST_ID);
      await spa.init({
        apply,
        location: { match: "/test", condition: () => true, timeout: 200 },
      });
      expect(apply).toHaveBeenCalled();
    });

    it("does not apply when location condition times out", async () => {
      vi.useFakeTimers();
      const apply = vi.fn();
      const spa = useSPA(TEST_ID);
      const initPromise = spa.init({
        apply,
        location: { match: "/test", condition: () => false, timeout: 100 },
      });
      await vi.advanceTimersByTimeAsync(300);
      await initPromise;
      vi.useRealTimers();
      expect(apply).not.toHaveBeenCalled();
    });
  });

  describe("event-driven re-initialization", () => {
    it("re-applies when page change event is dispatched on a matching page", async () => {
      const apply = vi.fn();
      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, apply });
      apply.mockClear();

      window.dispatchEvent(new Event("jf-pagechange-1.0"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(apply).toHaveBeenCalled();
    });

    it("calls reset when page change event is dispatched on a non-matching page", async () => {
      const reset = vi.fn();
      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, reset });

      window.location.pathname = "/no-match";
      window.dispatchEvent(new Event("jf-pagechange-1.0"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(reset).toHaveBeenCalled();
    });

    it("re-applies when reInit event is dispatched", async () => {
      const apply = vi.fn();
      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, apply });
      apply.mockClear();

      window.dispatchEvent(new Event("jf-reinit-1.0"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(apply).toHaveBeenCalled();
    });

    it("removes string selector elements on page change", async () => {
      const el = document.createElement("div");
      el.className = "jf-remove-me";
      document.body.appendChild(el);

      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, removeOnPageChange: ".jf-remove-me" });

      window.dispatchEvent(new Event("jf-pagechange-1.0"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(document.querySelector(".jf-remove-me")).toBeNull();
    });

    it("removes array selector elements on page change", async () => {
      const el1 = document.createElement("div");
      el1.className = "jf-remove-a";
      const el2 = document.createElement("div");
      el2.className = "jf-remove-b";
      document.body.appendChild(el1);
      document.body.appendChild(el2);

      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, removeOnPageChange: [".jf-remove-a", ".jf-remove-b"] });

      window.dispatchEvent(new Event("jf-pagechange-1.0"));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(document.querySelector(".jf-remove-a")).toBeNull();
      expect(document.querySelector(".jf-remove-b")).toBeNull();
    });
  });

  describe("DOM features", () => {
    it("inserts a stylesheet when style option is provided", async () => {
      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, style: ".test { color: red; }" });
      expect(document.querySelector(`#${TEST_ID}--style`)).not.toBeNull();
    });

    it("removes the stylesheet on reset", async () => {
      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, style: ".test { color: red; }" });
      await spa.reset();
      expect(document.querySelector(`#${TEST_ID}--style`)).toBeNull();
    });

    it("calls reset before applying when alwaysReset is true", async () => {
      const order: string[] = [];
      const apply = vi.fn(() => order.push("apply"));
      const reset = vi.fn(() => order.push("reset"));
      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, apply, reset, alwaysReset: true });
      expect(order).toEqual(["reset", "apply"]);
    });

    it("does not run a second instance with the same ID", async () => {
      const apply = vi.fn();
      const spa1 = useSPA(TEST_ID);
      await spa1.init({ ...defaultOptions, apply });
      apply.mockClear();

      const spa2 = useSPA(TEST_ID);
      await spa2.init({ ...defaultOptions, apply });
      expect(apply).not.toHaveBeenCalled();
    });

    it("accepts a custom removedNode option", async () => {
      const apply = vi.fn();
      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, apply, removedNode: "section" });
      expect(apply).toHaveBeenCalled();
    });

    it("should clean up elementRemoved callbacks with test ID prefix on reset", async () => {
      window.jfLib.elementRemoved = {
        "1.0": {
          observer: {
            details: { observer: new MutationObserver(() => {}), isObserving: false, ticketId: "er-1.0" },
            observe: vi.fn(),
            disconnect: vi.fn(),
          },
          callbacks: [
            { id: `${TEST_ID}--my-element`, callback: vi.fn() },
            { id: "OTHER_TEST--some-element", callback: vi.fn() },
          ],
        },
      };
      const spa = useSPA(TEST_ID);
      await spa.init(defaultOptions);
      await spa.reset();
      expect(window.jfLib.elementRemoved["1.0"].callbacks).toHaveLength(1);
      expect(window.jfLib.elementRemoved["1.0"].callbacks[0].id).toBe("OTHER_TEST--some-element");
    });

    it("should clean up elementUpdated callbacks with test ID prefix on reset", async () => {
      window.jfLib.elementUpdated = {
        "1.0": {
          observer: {
            details: { observer: new MutationObserver(() => {}), isObserving: false, ticketId: "eu-1.0" },
            observe: vi.fn(),
            disconnect: vi.fn(),
          },
          callbacks: [
            { id: `${TEST_ID}--my-element`, callback: vi.fn() },
            { id: "OTHER_TEST--some-element", callback: vi.fn() },
          ],
        },
      };
      const spa = useSPA(TEST_ID);
      await spa.init(defaultOptions);
      await spa.reset();
      expect(window.jfLib.elementUpdated["1.0"].callbacks).toHaveLength(1);
      expect(window.jfLib.elementUpdated["1.0"].callbacks[0].id).toBe("OTHER_TEST--some-element");
    });
  });

  describe("watchForRemoval", () => {
    beforeEach(() => {
      window.jfLib.observers?.["1.0"]?.forEach((obs) => obs.observer?.disconnect());
      window.jfLib.observers = { "1.0": [] };
    });

    it("re-applies when a watched element (string) is removed from the DOM", async () => {
      const apply = vi.fn();
      const div = document.createElement("div");
      div.className = "watched";
      document.body.appendChild(div);

      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, apply, watchForRemoval: ".watched" });
      apply.mockClear();

      document.body.removeChild(div);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(apply).toHaveBeenCalled();
    });

    it("re-applies when a watched element (array) is removed from the DOM", async () => {
      const apply = vi.fn();
      const div = document.createElement("div");
      div.className = "watched";
      document.body.appendChild(div);

      const spa = useSPA(TEST_ID);
      await spa.init({ ...defaultOptions, apply, watchForRemoval: [".watched", ".other"] });
      apply.mockClear();

      document.body.removeChild(div);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(apply).toHaveBeenCalled();
    });
  });
});
