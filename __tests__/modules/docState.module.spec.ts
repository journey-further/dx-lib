import { docReady } from "../../src";

const DEFAULT_TIMEOUT = 200;
const DEFAULT_ATTEMPTS = 10;

describe("docReady", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it("will return true if the document.readyState param is complete", async () => {
    jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "complete",
      configurable: true,
    });
    expect(await docReady()).toBe(true);
    expect(setTimeout).toHaveBeenCalledTimes(0);
  });

  it("will try maxAttempts times before returning false is readyState is not complete", async () => {
    jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "not-complete",
      configurable: true,
    });
    // Store our promise
    const promise = docReady(1);
    // Fast forward the timers
    jest.advanceTimersByTime(200);
    // Resolve the promise
    await promise;
    // Check set timeout
    expect(setTimeout).toBeCalledTimes(1);
  });

  it("will stop trying and return true when the readyState is complete", async () => {
    jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "not-complete",
      configurable: true,
    });
    const promise = docReady(5);
    // iterate twice
    for (let i = 0; i < 2; i++) {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    }
    // make the readyState complete
    Object.defineProperty(document, "readyState", {
      value: "complete",
      configurable: true,
    });
    // Move forward
    jest.advanceTimersByTime(200);
    await Promise.resolve();
    // Resolve our promise
    const result = await promise;
    expect(setTimeout).toBeCalledTimes(3);
    expect(result).toBe(true);
  });

  it("will default to 10 attempts", async () => {
    jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "not-complete",
      configurable: true,
    });
    // Store our promise
    const promise = docReady();
    // Fast forward the timers 15 times to try and force more attempts
    for (let i = 0; i < 15; i++) {
      jest.advanceTimersByTime(DEFAULT_TIMEOUT);
      await Promise.resolve();
    }
    // Resolve the promise
    await promise;
    // Check set timeout calls, they should be 10
    expect(setTimeout).toBeCalledTimes(DEFAULT_ATTEMPTS);
  });

  it("will have a default timeout of 200ms", async () => {
    const spy = jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "not-complete",
      configurable: true,
    });
    // Store our promise
    const promise = docReady(1);
    jest.advanceTimersByTime(DEFAULT_TIMEOUT);
    await Promise.resolve();
    await promise;
    expect(spy.mock.calls[0][1]).toBe(DEFAULT_TIMEOUT);
  });
});
