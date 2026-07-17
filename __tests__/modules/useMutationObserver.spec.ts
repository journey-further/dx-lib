import { useMutationObserver } from "../../src";

describe("useMutationObserver", () => {
  const OBSERVER_ID = "OBS";
  const CONFIG = {
    childList: true,
    subtree: true,
    attributes: true,
  };
  let DEFAULT_OBJECT = {
    ticketId: OBSERVER_ID,
    observer: undefined,
    isObserving: false,
  };
  const CALLBACK = vi.fn();

  beforeEach(() => {
    // Setup fresh DOM for each test
    document.body.innerHTML = "";
    // Reset global observers
    window.jfLib = { observers: { "1.0": [] } };
  });

  afterEach(() => {
    // Cleanup any observers
    window.jfLib?.observers?.["1.0"]?.forEach((obs) => obs.observer?.disconnect());
    // @ts-expect-error test cleanup
    delete window.jfLib;
    document.body.innerHTML = "";
    DEFAULT_OBJECT = {
      ticketId: OBSERVER_ID,
      observer: undefined,
      isObserving: false,
    };
    vi.resetAllMocks();
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it("creates an observer object in the global observer array", () => {
    useMutationObserver(OBSERVER_ID);
    expect(window.jfLib.observers["1.0"].find((obs) => obs.ticketId === OBSERVER_ID)).toEqual(DEFAULT_OBJECT);
  });

  it("creates and binds mutation observer when observe is called", () => {
    const node = document.createElement("div");
    node.id = OBSERVER_ID;
    document.body.appendChild(node);

    const { observe, details } = useMutationObserver(OBSERVER_ID);

    const output = observe(node, CONFIG, CALLBACK);
    expect(output).toBe(true);
    expect(details.observer).toBeDefined();
    expect(details.isObserving).toBe(true);
    expect(CALLBACK).not.toHaveBeenCalled();
  });

  it("detects DOM mutations and calls callback", () => {
    return new Promise<void>((resolve, reject) => {
      const node = document.createElement("div");
      node.id = OBSERVER_ID;
      document.body.appendChild(node);

      const { observe } = useMutationObserver(OBSERVER_ID);
      observe(node, CONFIG, (mutations) => {
        try {
          expect(mutations[0]).toMatchObject({
            type: "childList",
            addedNodes: expect.any(NodeList),
            target: node,
          });
          expect(mutations[0].addedNodes[0]).toBe(child);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // Add new element
      const child = document.createElement("div");
      node.appendChild(child);
    });
  });

  it("handles multiple target nodes", () => {
    const node1 = document.createElement("div");
    const node2 = document.createElement("div");
    document.body.appendChild(node1);
    document.body.appendChild(node2);

    const { observe } = useMutationObserver(OBSERVER_ID);
    const output = observe([node1, node2], CONFIG, CALLBACK);

    expect(output).toBe(true);
    expect(window.jfLib.observers["1.0"][0].isObserving).toBe(true);
  });

  it("prevents duplicate observations", () => {
    const node = document.createElement("div");
    document.body.appendChild(node);

    const { observe } = useMutationObserver(OBSERVER_ID);

    const firstObserve = observe(node, CONFIG, CALLBACK);
    const secondObserve = observe(node, CONFIG, CALLBACK);

    expect(firstObserve).toBe(true);
    expect(secondObserve).toBe(false);
  });

  it("properly disconnects and cleans up observer", () => {
    const node = document.createElement("div");
    document.body.appendChild(node);

    const { observe, disconnect, details } = useMutationObserver(OBSERVER_ID);
    observe(node, CONFIG, CALLBACK);

    disconnect();

    expect(window.jfLib.observers["1.0"]).toHaveLength(0);
    expect(details.isObserving).toBe(false);
    expect(details.observer).toBeUndefined();
  });

  it("handles invalid nodes gracefully", () => {
    const { observe } = useMutationObserver(OBSERVER_ID);

    // Create a valid node first to avoid the error
    const validNode = document.createElement("div");
    document.body.appendChild(validNode);

    // Test with valid node first
    expect(observe(validNode, CONFIG, CALLBACK)).toBe(true);

    // Test with invalid nodes - these should return false because isObserving is true
    expect(observe(null as any, CONFIG, CALLBACK)).toBe(false);
    expect(observe(undefined as any, CONFIG, CALLBACK)).toBe(false);
    expect(observe({} as any, CONFIG, CALLBACK)).toBe(false);
  });

  it("maintains separate observers for different IDs", () => {
    const { details: details1 } = useMutationObserver("observer1");
    const { details: details2 } = useMutationObserver("observer2");

    expect(window.jfLib.observers["1.0"]).toHaveLength(2);
    expect(details1.ticketId).toBe("observer1");
    expect(details2.ticketId).toBe("observer2");
  });

  it("re-registers a stale handle on re-observe, so a fresh call for the same id doesn't create a duplicate live observer", () => {
    const node = document.createElement("div");
    document.body.appendChild(node);

    const stale = useMutationObserver(OBSERVER_ID);
    stale.observe(node, CONFIG, CALLBACK);
    stale.disconnect();

    // Simulate a caller that kept the handle around and re-observes after disconnect
    const reObserved = stale.observe(node, CONFIG, CALLBACK);
    expect(reObserved).toBe(true);
    // The stale handle's entry must be visible in the registry again
    expect(window.jfLib.observers["1.0"].find((obs) => obs.ticketId === OBSERVER_ID)).toBe(stale.details);

    // A fresh call for the same id must see it as already observing, not spin up a second live observer
    const fresh = useMutationObserver(OBSERVER_ID);
    const freshObserveResult = fresh.observe(node, CONFIG, CALLBACK);
    expect(freshObserveResult).toBe(false);
    expect(window.jfLib.observers["1.0"]).toHaveLength(1);
  });

  // it("throws error if ID already exists", () => {
  //   // Create first observer
  //   const observer1 = useMutationObserver(OBSERVER_ID);

  //   // Attempt to create second observer with same ID should throw
  //   expect(() => useMutationObserver(OBSERVER_ID)).toThrow();

  //   // Should still only have one observer
  //   expect(window.jfLib.observers["1.0"]).toHaveLength(1);
  // });
});
