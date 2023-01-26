import { waitFor } from "../../src";

("use strict");

// We need to mock our timers
jest.useFakeTimers({ advanceTimers: true });
jest.spyOn(global, "setTimeout");

describe("waitFor", () => {
  // Cleanup after each test
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it("will return the truthy value", async () => {
    const callback = jest.fn().mockReturnValue(document.createElement("div"));
    const result = await waitFor(callback);
    expect(result).toBeDefined();
    expect(result instanceof HTMLElement).toBe(true);
    expect(setTimeout).toBeCalledTimes(0);
  });

  it("will call callback 20 times by default", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    await waitFor(callback, undefined, 1); // set poll to 1s as we don't care about that
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect(callback).toHaveBeenCalledTimes(20);
  });

  it("will call callback X times by when passed", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    await waitFor(callback, 50, 1); // set poll to 1s as we don't care about that
    expect(setTimeout).toHaveBeenCalledTimes(50);
    expect(callback).toHaveBeenCalledTimes(50);
  });

  it("will call timeout with the correct default poll values", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    waitFor(callback);
    for (let i = 0; i < 20; i++) {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    }
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect((setTimeout as unknown as jest.Mock).mock.calls[0][1]).toBe(200); // First recursion should be 100 + 100
    expect((setTimeout as unknown as jest.Mock).mock.calls[19][1]).toBe(2100); // Last recursion should be 2100
  });

  it("will call timeout with the correct provided poll values", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    await waitFor(callback, undefined, 1); // set poll to 1s as we dont care about that
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect((setTimeout as unknown as jest.Mock).mock.calls[0][1]).toBe(2); // First recursion should be 1 + 1
    expect((setTimeout as unknown as jest.Mock).mock.calls[19][1]).toBe(21); // Last recursion should be 20 + 1
  });
});
