import { useSetTimeout } from "modules/useSetTimeout";

jest.useFakeTimers();
describe("useSetTimeout", () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    delete window.jfTimers;
  });

  const TIMEOUT_ID = "HEY";
  const CALLBACK = jest.fn();

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

  it("will push the correct object to the window array when a timer is added", () => {
    expect(window.jfTimers).not.toBeDefined();
    const obj = useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    const objFromWindow = window.jfTimers.find((timer) => timer.id === TIMEOUT_ID);
    expect(obj.timer).toBeDefined();
    expect(obj.id).toBe(TIMEOUT_ID);
    expect(objFromWindow).toBe(obj);
  });

  it("will remove the original timer if one with the same ID is added", () => {
    expect(window.jfTimers).not.toBeDefined();
    useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    expect(window.jfTimers.length).toBe(1);
    jest.runAllTimers();
    expect(CALLBACK).toBeCalledTimes(1);
  });

  it("will call the provided callback when timeout is exceeded", () => {
    expect(CALLBACK).toBeCalledTimes(0);
    useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    jest.runAllTimers();
    expect(CALLBACK).toBeCalledTimes(1);
  });

  it("will remove the timerObject from the window array when the timeout is exceeded", () => {
    expect(CALLBACK).toBeCalledTimes(0);
    useSetTimeout(CALLBACK, 100, TIMEOUT_ID);
    jest.runAllTimers();
    expect(CALLBACK).toBeCalledTimes(1);
    const objFromWindow = window.jfTimers.find((timer) => timer.id === TIMEOUT_ID);
    expect(objFromWindow).not.toBeDefined();
    expect(window.jfTimers.length).toBe(0);
  });
});
