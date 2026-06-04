import { waitForNuxtStable } from "../../src";

("use strict");

describe("waitForNuxtStable", () => {
  let setTimeoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    setTimeoutSpy = vi.spyOn(global, "setTimeout");
  });

  afterEach(() => {
    delete (window as Window & { $nuxt?: unknown }).$nuxt;
    vi.clearAllTimers();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("resolves true immediately when $nuxt.$store is already present", async () => {
    window.$nuxt = { $store: {} };
    const promise = waitForNuxtStable();
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe(true);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(0);
  });

  it("resolves false after polling exhausted when $nuxt never appears", async () => {
    const promise = waitForNuxtStable(undefined, 1);
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe(false);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(20);
  });

  it("resolves true when $nuxt.$store becomes available mid-poll", async () => {
    const promise = waitForNuxtStable(20, 100);
    // Advance two ticks so a few polls fire without Nuxt, then attach it
    vi.advanceTimersByTime(200);
    await Promise.resolve();
    window.$nuxt = { $store: {} };
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe(true);
  });

  it("honours custom maxTries and timeout args", async () => {
    const promise = waitForNuxtStable(5, 50);
    await vi.runAllTimersAsync();
    await promise;
    expect(setTimeoutSpy).toHaveBeenCalledTimes(5);
    expect(setTimeoutSpy.mock.calls[0][1]).toBe(50);
  });

  it("calls $nextTick when Nuxt is present and $nextTick is available", async () => {
    const nextTick = vi.fn().mockResolvedValue(undefined);
    window.$nuxt = { $store: {}, $nextTick: nextTick };
    const promise = waitForNuxtStable();
    await vi.runAllTimersAsync();
    await promise;
    expect(nextTick).toHaveBeenCalledTimes(1);
  });

  it("does not call $nextTick when Nuxt is not found", async () => {
    const nextTick = vi.fn().mockResolvedValue(undefined);
    // $nuxt never appears — nextTick should never be called
    const promise = waitForNuxtStable(2, 1);
    await vi.runAllTimersAsync();
    await promise;
    expect(nextTick).not.toHaveBeenCalled();
  });

  it("calls requestAnimationFrame twice regardless of outcome", async () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");

    // Stable case
    window.$nuxt = { $store: {} };
    const stablePromise = waitForNuxtStable();
    await vi.runAllTimersAsync();
    await stablePromise;
    expect(rafSpy).toHaveBeenCalledTimes(2);

    rafSpy.mockClear();
    delete (window as Window & { $nuxt?: unknown }).$nuxt;

    // Timed-out case
    const timedOutPromise = waitForNuxtStable(2, 1);
    await vi.runAllTimersAsync();
    await timedOutPromise;
    expect(rafSpy).toHaveBeenCalledTimes(2);
  });
});
