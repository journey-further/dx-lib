import type { Mock } from "vitest";
import { waitFor } from "../../src";

("use strict");

describe("waitFor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, "setTimeout");
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
    vi.useRealTimers();
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
  });

  it("will return the truthy value", async () => {
    const callback = vi.fn().mockReturnValue(document.createElement("div"));
    const result = await waitFor(callback);
    expect(result).toBeDefined();
    expect(result instanceof HTMLElement).toBe(true);
    expect(setTimeout).toBeCalledTimes(0);
  });

  it("will call callback 20 times by default", async () => {
    const callback = vi.fn().mockReturnValue(undefined);
    const promise = waitFor(callback, undefined, 1); // set poll to 1ms as we don't care about that
    await vi.runAllTimersAsync();
    await promise;
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect(callback).toHaveBeenCalledTimes(20);
  });

  it("will call callback X times by when passed", async () => {
    const callback = vi.fn().mockReturnValue(undefined);
    const promise = waitFor(callback, 50, 1); // set poll to 1ms as we don't care about that
    await vi.runAllTimersAsync();
    await promise;
    expect(setTimeout).toHaveBeenCalledTimes(50);
    expect(callback).toHaveBeenCalledTimes(50);
  });

  it("will call timeout with the correct default poll values", async () => {
    const callback = vi.fn().mockReturnValue(undefined);
    const promise = waitFor(callback);
    await vi.runAllTimersAsync();
    await promise;
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect((setTimeout as unknown as Mock).mock.calls[0][1]).toBe(100); // First recursion should be 100ms
  });

  it("will call timeout with the correct provided poll values", async () => {
    const callback = vi.fn().mockReturnValue(undefined);
    const promise = waitFor(callback, undefined, 1); // set poll to 1ms
    await vi.runAllTimersAsync();
    await promise;
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect((setTimeout as unknown as Mock).mock.calls[0][1]).toBe(1); // First recursion should be 1ms
  });
});
