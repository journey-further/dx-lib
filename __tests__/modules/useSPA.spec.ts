import type { Mock } from "vitest";
import { useSPA } from "../../src";
import { JfSPAOptions } from "../../src/modules/useSPA";
import { JfLib } from "../../src/globals";

// Mock Error constructor
const originalError = Error;
global.Error = Object.assign(
  vi.fn((message?: string) => new originalError(message)),
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
      experiments: [],
      pagePath: "/test",
      pageChange: {
        "1.0": {
          observer: {
            details: {
              observer: new MutationObserver(() => {}),
              isObserving: false,
              ticketId: "pageChange-1.0",
            },
            observe: vi.fn().mockReturnValue(true),
            disconnect: vi.fn(),
          },
        },
      },
      reInit: {
        "1.0": {
          observer: {
            details: {
              observer: new MutationObserver(() => {}),
              isObserving: false,
              ticketId: "reInit-1.0",
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
    expect(window.jfLib.experiments).toHaveLength(1);
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
    window.jfLib.experiments = [
      {
        details: { id: TEST_ID, isRunning: true },
        options: defaultOptions,
        loopCount: 0,
      } as any,
    ];

    spa.destroy();
    expect(window.jfLib.experiments).toHaveLength(0);
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
    const exp = window.jfLib.experiments[0];
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
    await window.jfLib.experiments[0].reset();
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
});
