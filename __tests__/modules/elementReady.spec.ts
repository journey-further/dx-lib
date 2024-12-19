import { elementReady } from "../../src/modules/elementReady";

describe("elementReady", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.jfLib = { elementReady: {} };
  });

  it("validates input parameters", () => {
    expect(() => elementReady("", jest.fn(), "test-id")).toThrow("elementReady: selector is required");
    expect(() => elementReady(".test", null as any, "test-id")).toThrow("elementReady: callback is required");
    expect(() => elementReady(".test", jest.fn(), "")).toThrow("elementReady: id is required");
  });

  it("detects existing elements", () => {
    const callback = jest.fn();
    document.body.innerHTML = '<div class="test"></div>';

    elementReady(".test", callback, "test-id");
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("detects new elements", (done) => {
    const callback = jest.fn();
    elementReady(".test", callback, "test-id");

    // Add element after a delay
    setTimeout(() => {
      document.body.innerHTML = '<div class="test"></div>';

      // Check after another small delay to allow mutation observer to fire
      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(expect.any(Element));
        done();
      }, 100);
    }, 100);
  });

  it("marks elements as ready", () => {
    const callback = jest.fn();
    document.body.innerHTML = '<div class="test"></div>';

    elementReady(".test", callback, "test-id");
    const element = document.querySelector(".test") as Element;

    expect(element.ready).toContain("test-id");
    expect(callback).toHaveBeenCalledTimes(1);

    // Should not call callback again for same element
    elementReady(".test", callback, "test-id");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("respects conditions", () => {
    const callback = jest.fn();
    document.body.innerHTML = '<div class="test"></div>';

    elementReady(".test", callback, "test-id", (el) => false);
    expect(callback).not.toHaveBeenCalled();

    elementReady(".test", callback, "test-id-2", (el) => true);
    expect(callback).toHaveBeenCalled();
  });

  it("can be destroyed", async () => {
    const callback = jest.fn();
    const { destroy } = elementReady(".test", callback, "test-id");

    await destroy();

    document.body.innerHTML = '<div class="test"></div>';
    // Wait for potential mutation observer
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(callback).not.toHaveBeenCalled();
  });
});
