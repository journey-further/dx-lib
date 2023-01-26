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
  const CALLBACK = jest.fn();
  afterEach(() => {
    delete window.jfObservers;
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
    DEFAULT_OBJECT = {
      ticketId: OBSERVER_ID,
      observer: undefined,
      isObserving: false,
    };
    jest.resetAllMocks();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it("will create an observer object and push it into the global observer array if there isn't one with the Id provided there already", () => {
    useMutationObserver(OBSERVER_ID);
    expect(window.jfObservers.find((obs) => obs.ticketId === OBSERVER_ID)).toEqual(DEFAULT_OBJECT);
  });

  it("will return info from the current observer object if there is one with the provided ID already in the global array", () => {
    window.jfObservers = [DEFAULT_OBJECT];
    const { details } = useMutationObserver(OBSERVER_ID);
    expect(window.jfObservers.find((obs) => obs.ticketId === OBSERVER_ID)).toEqual(DEFAULT_OBJECT);
    expect(window.jfObservers).toHaveLength(1);
    expect(details).toBe(DEFAULT_OBJECT);
  });

  it("will correctly create a mutation observer and assign it to the correct observer object when the observe function it exposes is called", () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}">Hey</div>`);
    window.jfObservers = [DEFAULT_OBJECT];
    const { observe, details } = useMutationObserver(OBSERVER_ID);
    const node = document.querySelector(`#${OBSERVER_ID}`);
    const output = observe(node, CONFIG, CALLBACK);
    expect(output).toBe(true);
    expect(DEFAULT_OBJECT.observer).toBeDefined();
    expect(CALLBACK).not.toHaveBeenCalled();
  });

  it("will correctly attach the observer to the provided node and fire the provided callback when a mutation occurs", () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}">Hey</div>`);
    window.jfObservers = [DEFAULT_OBJECT];
    const { observe, details } = useMutationObserver(OBSERVER_ID);
    const node = document.querySelector(`#${OBSERVER_ID}`);
    const output = observe(node, CONFIG, CALLBACK);
    expect(output).toBe(true);
    expect(DEFAULT_OBJECT.observer).toBeDefined();
    expect(CALLBACK).not.toHaveBeenCalled();
    node.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}-2">Hey</div>`);
    setTimeout(() => {
      expect(CALLBACK).toHaveBeenCalled();
    }, 200);
  });

  it("will return false if you try and call the observe function while the observer is already observing", () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}">Hey</div>`);
    window.jfObservers = [DEFAULT_OBJECT];
    const { observe, details } = useMutationObserver(OBSERVER_ID);
    const node = document.querySelector(`#${OBSERVER_ID}`);
    const output = observe(node, CONFIG, CALLBACK);
    expect(output).toBe(true);
    expect(DEFAULT_OBJECT.observer).toBeDefined();
    expect(observe(node, CONFIG, CALLBACK)).toBe(false);
  });

  it("will correctly disconnect and clean the observer object from the global array if you call the disconnect method", () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${OBSERVER_ID}">Hey</div>`);
    window.jfObservers = [DEFAULT_OBJECT];
    const { observe, disconnect } = useMutationObserver(OBSERVER_ID);
    const node = document.querySelector(`#${OBSERVER_ID}`);
    const output = observe(node, CONFIG, CALLBACK);
    expect(output).toBe(true);
    disconnect();
    expect(window.jfObservers).toHaveLength(0);
    expect(DEFAULT_OBJECT.isObserving).toBe(false);
    expect(DEFAULT_OBJECT.observer).toBe(undefined);
  });
});
