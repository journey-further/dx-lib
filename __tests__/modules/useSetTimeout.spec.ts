import { useSetTimeout } from "modules/useSetTimeout";

describe("useSetTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    vi.clearAllMocks();
    // @ts-expect-error test cleanup
    delete window.jfLib;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const TIMEOUT_ID = "HEY";
  const CALLBACK = vi.fn();

  it("will throw the correct errors if args are missing", () => {
    // @ts-ignore
    expect(() => useSetTimeout()).toThrowError("Arg 1 must be a function");
    // @ts-ignore
    expect(() => useSetTimeout("HEY")).toThrowError("Arg 1 must be a function");
    // @ts-ignore
    expect(() => useSetTimeout(() => {}, "HEY")).toThrowError("Arg 2 must be a number");
    // @ts-ignore
    expect(() => useSetTimeout(() => {})).toThrowError("Arg 2 must be a number");
    // @ts-ignore
    expect(() => useSetTimeout(() => {}, 123)).toThrowError("Arg 3 must be a string");
    // @ts-ignore
    expect(() => useSetTimeout(() => {}, 123, 123)).toThrowError("Arg 3 must be a string");
  });

  it("will push the correct object to the registry when a timer is added", () => {
    expect(window.jfLib?.timers).not.toBeDefined();
    const obj = useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    const objFromWindow = window.jfLib.timers["1.0"].find((timer) => timer.id === TIMEOUT_ID);
    expect(obj.timer).toBeDefined();
    expect(obj.id).toBe(TIMEOUT_ID);
    expect(objFromWindow).toBe(obj);
  });

  it("will remove the original timer if one with the same ID is added", () => {
    expect(window.jfLib?.timers).not.toBeDefined();
    useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    expect(window.jfLib.timers["1.0"].length).toBe(1);
    vi.runAllTimers();
    expect(CALLBACK).toBeCalledTimes(1);
  });

  it("will call the provided callback when timeout is exceeded", () => {
    expect(CALLBACK).toBeCalledTimes(0);
    useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    vi.runAllTimers();
    expect(CALLBACK).toBeCalledTimes(1);
  });

  it("will remove the timerObject from the registry when the timeout is exceeded", () => {
    expect(CALLBACK).toBeCalledTimes(0);
    useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    vi.runAllTimers();
    expect(CALLBACK).toBeCalledTimes(1);
    const objFromWindow = window.jfLib.timers["1.0"].find((timer) => timer.id === TIMEOUT_ID);
    expect(objFromWindow).not.toBeDefined();
    expect(window.jfLib.timers["1.0"].length).toBe(0);
  });

  it("will return the correct object when it is called", () => {
    const obj = useSetTimeout(CALLBACK, 200, TIMEOUT_ID);
    expect(obj.id).toBe(TIMEOUT_ID);
    expect(obj.handler).toBe(CALLBACK);
    expect(obj.timeout).toBe(200);
    expect(obj.timer).toBeDefined(); // Node.js returns Timeout object; browsers return number
    expect(typeof obj.disconnect).toBe("function");
  });
});
