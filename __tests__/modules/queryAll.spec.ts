import { queryAll } from "../../src";

("use strict");

const MOCK_QUERY = ".mock";

// We need to mock our timers
jest.useFakeTimers({ advanceTimers: true });
jest.spyOn(global, "setTimeout");

describe("queryAll", () => {
  it("will return a true array", () => {
    const result = queryAll(MOCK_QUERY);
    expect(Array.isArray(result)).toBe(true);
    expect(result.reduce).toBeDefined();
  });

  it("will call querySelectorAll with the provided argument", () => {
    const spy = jest.spyOn(document, "querySelectorAll");
    queryAll(MOCK_QUERY);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(MOCK_QUERY);
  });
});
