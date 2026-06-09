import { elementReady } from "../../src/modules/elementReady";

describe("elementReady", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.jfLib = { elementReady: {} };
    // Clear any existing observers
    window.jfObservers?.forEach((obs) => obs.observer?.disconnect());
    window.jfObservers = [];
  });

  it("validates input parameters", () => {
    expect(() => elementReady("", vi.fn(), "test-id")).toThrow("elementReady setup failed");
    expect(() => elementReady(".test", null as any, "test-id")).toThrow("elementReady setup failed");
    expect(() => elementReady(".test", vi.fn(), "")).toThrow("elementReady setup failed");
  });

  it("detects existing elements", () => {
    const callback = vi.fn();
    document.body.innerHTML = '<div class="test"></div>';

    elementReady(".test", callback, "test-id");
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("detects new elements", async () => {
    const callback = vi.fn();
    elementReady(".test", callback, "test-id");

    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("marks elements as ready", () => {
    const callback = vi.fn();
    document.body.innerHTML = '<div class="test"></div>';

    elementReady(".test", callback, "test-id");
    const element = document.querySelector(".test") as any;

    expect(element.jfReady).toContain("test-id");
    expect(callback).toHaveBeenCalledTimes(1);

    // Should not call callback again for same element
    elementReady(".test", callback, "test-id");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("respects conditions", () => {
    const callback = vi.fn();
    document.body.innerHTML = '<div class="test"></div>';

    elementReady(".test", callback, "test-id", (el) => false);
    expect(callback).not.toHaveBeenCalled();

    elementReady(".test", callback, "test-id-2", (el) => true);
    expect(callback).toHaveBeenCalled();
  });

  it("can be destroyed", async () => {
    const callback = vi.fn();
    const { destroy } = elementReady(".test", callback, "test-id");

    // Wait for observer to be initialized
    await new Promise((resolve) => setTimeout(resolve, 100));

    await destroy();

    document.body.innerHTML = '<div class="test"></div>';
    // Wait for potential mutation observer
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(callback).not.toHaveBeenCalled();
  });

  it("validates selector format", () => {
    // Only test the number input since invalid[selector is actually valid CSS
    expect(() => elementReady(123 as any, vi.fn(), "test-id")).toThrow("elementReady setup failed");
    // Test a definitely invalid selector instead
    expect(() => elementReady(">>>>>>", vi.fn(), "test-id")).toThrow("elementReady setup failed");
  });

  it("validates conditions parameter", () => {
    expect(() => elementReady(".test", vi.fn(), "test-id", "not-a-function" as any)).toThrow(
      "elementReady setup failed"
    );
  });

  it("handles multiple elements with same selector", () => {
    const callback = vi.fn();
    document.body.innerHTML = `
      <div class="test"></div>
      <div class="test"></div>
      <div class="test"></div>
    `;

    elementReady(".test", callback, "test-id");
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("handles nested elements", () => {
    const callback = vi.fn();
    document.body.innerHTML = `
      <div class="parent">
        <div class="test"></div>
        <div class="wrapper">
          <div class="test"></div>
        </div>
      </div>
    `;

    elementReady(".test", callback, "test-id");
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("maintains separate ready states for different IDs", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    document.body.innerHTML = '<div class="test"></div>';

    elementReady(".test", callback1, "test-id-1");
    elementReady(".test", callback2, "test-id-2");

    const element = document.querySelector(".test") as any;
    expect(element.jfReady).toContain("test-id-1");
    expect(element.jfReady).toContain("test-id-2");
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("handles complex conditions", () => {
    const callback = vi.fn();
    document.body.innerHTML = `
      <div class="test" data-ready="true"></div>
      <div class="test" data-ready="false"></div>
    `;

    elementReady(".test", callback, "test-id", (el) => el.getAttribute("data-ready") === "true");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(document.querySelector('[data-ready="true"]'));
  });

  it("can be paused and resumed", async () => {
    const callback = vi.fn();
    const { pause, init } = elementReady(".test", callback, "test-id");

    // Pause the observer
    await pause();

    // Add element while paused
    document.body.innerHTML = '<div class="test"></div>';
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).not.toHaveBeenCalled();

    // Resume observing
    init();

    // Add new element
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalled();
  });

  it("handles dynamic class changes", async () => {
    const callback = vi.fn();
    elementReady(".test", callback, "test-id");

    // Create div and add to document
    const div = document.createElement("div");
    document.body.appendChild(div);

    // Remove and re-add with class
    document.body.removeChild(div);
    div.className = "test";
    document.body.appendChild(div);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("detects elements added after attribute changes", async () => {
    const callback = vi.fn();
    elementReady("[data-test]", callback, "test-id");

    // Add element without attribute first
    const div = document.createElement("div");
    document.body.appendChild(div);

    // Remove and re-add with attribute
    document.body.removeChild(div);
    div.setAttribute("data-test", "true");
    document.body.appendChild(div);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(div);
  });
});
