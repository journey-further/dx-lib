import { waitForElement } from "../../src";

("use strict");

const MOCK_QUERY = ".mock";

// We need to mock our timers
jest.useFakeTimers({ advanceTimers: true });
jest.spyOn(global, "setTimeout");

describe("waitForElement", () => {
  // Cleanup after each test
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it("will return the truthy value", async () => {
		// Insert a div with class of mock
		document.body.insertAdjacentHTML("afterbegin", `<div class="mock"></div>`)
		const querySelector = jest.spyOn(document, "querySelector")
    const result = await waitForElement(MOCK_QUERY);
		expect(querySelector).toHaveBeenCalled(); // Should have called document.querySelector
    expect(result).toBeDefined(); 
    expect(result instanceof HTMLElement).toBe(true);
    expect(setTimeout).toBeCalledTimes(0);
  });

  it("will call callback 20 times by default", async () => {
    await waitForElement(MOCK_QUERY, undefined, 1); // set poll to 1s as we don't care about that
    expect(setTimeout).toHaveBeenCalledTimes(20);
    // expect(callback).toHaveBeenCalledTimes(20);
  });

  it("will call callback X times by when passed", async () => {
    await waitForElement(MOCK_QUERY, 50, 1); // set poll to 1s as we don't care about that
    expect(setTimeout).toHaveBeenCalledTimes(50);
    // expect(callback).toHaveBeenCalledTimes(50);
  });

  it("will call timeout with the correct default poll values", async () => {
    waitForElement(MOCK_QUERY);
    for (let i = 0; i < 20; i++) {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    }
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect((setTimeout as unknown as jest.Mock).mock.calls[0][1]).toBe(200); // First recursion should be 100 + 100
    expect((setTimeout as unknown as jest.Mock).mock.calls[19][1]).toBe(2100); // Last recursion should be 2100
  });

  it("will call timeout with the correct provided poll values", async () => {
    await waitForElement(MOCK_QUERY, undefined, 1); // set poll to 1s as we dont care about that
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect((setTimeout as unknown as jest.Mock).mock.calls[0][1]).toBe(2); // First recursion should be 1 + 1
    expect((setTimeout as unknown as jest.Mock).mock.calls[19][1]).toBe(21); // Last recursion should be 20 + 1
  });
});
