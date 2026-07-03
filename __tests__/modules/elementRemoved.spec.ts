import { elementRemoved } from "../../src/modules/elementRemoved";

describe("elementRemoved", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.jfLib = { elementRemoved: {} };
    // Clear any existing observers
    window.jfObservers?.forEach((obs) => obs.observer?.disconnect());
    window.jfObservers = [];
  });

  it("validates input parameters", () => {
    expect(() => elementRemoved("", vi.fn(), "test-id")).toThrow("elementRemoved setup failed");
    expect(() => elementRemoved(".test", null as any, "test-id")).toThrow("elementRemoved setup failed");
    expect(() => elementRemoved(".test", vi.fn(), "")).toThrow("elementRemoved setup failed");
  });

  it("validates selector format", () => {
    expect(() => elementRemoved(123 as any, vi.fn(), "test-id")).toThrow("elementRemoved setup failed");
    expect(() => elementRemoved(">>>>>>", vi.fn(), "test-id")).toThrow("elementRemoved setup failed");
  });

  it("validates conditions parameter", () => {
    expect(() => elementRemoved(".test", vi.fn(), "test-id", "not-a-function" as any)).toThrow(
      "elementRemoved setup failed"
    );
  });

  it("detects removed elements", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    elementRemoved(".test", callback, "test-id");
    document.body.removeChild(div);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("handles nested element removal", async () => {
    const callback = vi.fn();
    document.body.innerHTML = `
      <div class="parent">
        <div class="test"></div>
        <div class="wrapper">
          <div class="test"></div>
        </div>
      </div>
    `;

    const parent = document.querySelector(".parent");
    elementRemoved(".test", callback, "test-id");

    if (parent) {
      document.body.removeChild(parent);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(callback).toHaveBeenCalledTimes(1);
    }
  });

  it("respects conditions", async () => {
    const callback = vi.fn();
    document.body.innerHTML = `
      <div class="test" data-remove="true"></div>
      <div class="test" data-remove="false"></div>
    `;

    elementRemoved(".test", callback, "test-id", (el) => el.getAttribute("data-remove") === "true");

    const elements = document.querySelectorAll(".test");
    elements.forEach((el) => document.body.removeChild(el));

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("can be destroyed", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    const { destroy } = elementRemoved(".test", callback, "test-id");

    // Wait for observer to be initialized
    await new Promise((resolve) => setTimeout(resolve, 100));
    await destroy();

    document.body.removeChild(div);
    // Wait for potential mutation observer
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(callback).not.toHaveBeenCalled();
  });

  it("handles multiple removals with same selector", async () => {
    const callback = vi.fn();
    document.body.innerHTML = `
      <div class="test"></div>
      <div class="test"></div>
      <div class="test"></div>
    `;

    elementRemoved(".test", callback, "test-id");

    const elements = document.querySelectorAll(".test");
    elements.forEach((el) => document.body.removeChild(el));

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("can be reinitialized after destruction", async () => {
    const callback = vi.fn();
    const { destroy, init } = elementRemoved(".test", callback, "test-id");

    // Wait for observer to be initialized
    await new Promise((resolve) => setTimeout(resolve, 100));
    await destroy();

    // Reinitialize
    init();

    // Add and remove element
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);
    document.body.removeChild(div);

    // Wait for mutation observer
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("does not re-bind when called with a duplicate id", () => {
    const callback = vi.fn();
    elementRemoved(".test", callback, "test-id");
    expect(() => elementRemoved(".test", callback, "test-id")).not.toThrow();
  });

  it("does not fire when an unrelated element is removed", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "unrelated";
    document.body.appendChild(div);

    elementRemoved(".test", callback, "test-id");
    document.body.removeChild(div);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("standard handle shape", () => {
  it("exposes details and pause with a live isListening flag", async () => {
    const handle = elementRemoved(".handle-test", vi.fn(), "HANDLE_2");
    expect(handle.details.isListening).toBe(true);
    await handle.pause(0);
    expect(handle.details.isListening).toBe(false);
  });
});
