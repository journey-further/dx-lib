import { waitForElement } from "../../src";

("use strict");

const MOCK_QUERY = ".mock";

describe("waitForElement", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, "setTimeout");
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
    vi.clearAllTimers();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("will return the truthy value", async () => {
    document.body.insertAdjacentHTML("afterbegin", `<div class="mock"></div>`);
    const querySelector = vi.spyOn(document, "querySelector");
    const result = await waitForElement(MOCK_QUERY);
    expect(querySelector).toHaveBeenCalled(); // Should have called document.querySelector
    expect(result).toBeDefined();
    expect(result instanceof HTMLElement).toBe(true);
    expect(setTimeout).toBeCalledTimes(0);
  });

  it("will call callback 20 times by default", async () => {
    const promise = waitForElement(MOCK_QUERY, undefined, 1); // set poll to 1ms as we don't care about that
    await vi.runAllTimersAsync();
    await promise;
    expect(setTimeout).toHaveBeenCalledTimes(20);
  });

  it("will call callback X times by when passed", async () => {
    const promise = waitForElement(MOCK_QUERY, 50, 1); // set poll to 1ms as we don't care about that
    await vi.runAllTimersAsync();
    await promise;
    expect(setTimeout).toHaveBeenCalledTimes(50);
  });
});
