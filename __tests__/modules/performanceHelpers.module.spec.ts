import { debounce } from "../../src";

// As the debounce uses a timeout we need fake ones
jest.useFakeTimers();

describe("debounce", () => {
  it("will call the function passed as a callback", () => {
    // Callback to check
    const callback = jest.fn();
    // Debounced invocation of the callback
    const debounced = debounce(() => callback());
    // Call the debounced invocation
    debounced();
    // Make sure all timers finish
    jest.runAllTimers();
    expect(callback).toBeCalledTimes(1);
  });

  it("will wait for timeout to finish before calling the callback", () => {
    // Callback to check
    const callback = jest.fn();
    // Debounced invocation of the callback
    const debounced = debounce(() => callback(), 10000); // set a delay of 10s so we can ensure it isnt exceeded
    // Call the debounced invocation
    debounced();
    expect(callback).toBeCalledTimes(0);
    // Make sure all timers finish
    jest.advanceTimersByTime(10000); // advance beyond this timer
    expect(callback).toBeCalledTimes(1);
  });
});
