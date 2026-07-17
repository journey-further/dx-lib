import { elementReady } from "../../src/modules/elementReady";

describe("elementReady", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.jfLib?.observers?.["1.0"]?.forEach((obs) => obs.observer?.disconnect());
    window.jfLib = { elementReady: {}, observers: { "1.0": [] } };
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

  it("destroy clears jfReady from marked elements", async () => {
    document.body.innerHTML = '<div class="test"></div>';
    const callback = vi.fn();
    const { destroy } = elementReady(".test", callback, "test-id");

    const el = document.querySelector(".test") as any;
    expect(el.jfReady).toContain("test-id");

    await destroy(0);

    expect(el.jfReady).toBeUndefined();
  });

  it("destroy removes only the matching id from jfReady when other ids are still registered", async () => {
    document.body.innerHTML = '<div class="test"></div>';
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const { destroy } = elementReady(".test", cb1, "id-1");
    elementReady(".test", cb2, "id-2");

    const el = document.querySelector(".test") as any;
    expect(el.jfReady).toContain("id-1");
    expect(el.jfReady).toContain("id-2");

    await destroy(0);

    expect(el.jfReady).not.toContain("id-1");
    expect(el.jfReady).toContain("id-2");
    expect(el.jfReady).not.toBeUndefined();
  });

  it("does not let a throwing callback starve other callbacks, and retries the throwing element on the next mutation", async () => {
    const cb1 = vi.fn(() => {
      throw new Error("boom");
    });
    const cb2 = vi.fn();

    elementReady(".test", cb1, "id-1");
    elementReady(".test", cb2, "id-2");

    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // cb2 must still fire for this mutation despite cb1 throwing for the same element
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb1).toHaveBeenCalledTimes(1);

    // the throwing callback's id must NOT be marked ready - a transient throw shouldn't
    // permanently skip the element
    expect((div as any).jfReady).not.toContain("id-1");
    expect((div as any).jfReady).toContain("id-2");

    // a further mutation should retry the throwing callback against the still-unmarked element
    const other = document.createElement("div");
    other.className = "test";
    document.body.appendChild(other);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(cb1.mock.calls.length).toBeGreaterThan(1);
    expect((div as any).jfReady).not.toContain("id-1");
  });

  it("pause and destroy do not reject when window.jfLib is wiped externally", async () => {
    document.body.innerHTML = '<div class="test"></div>';
    const callback = vi.fn();
    const handle = elementReady(".test", callback, "test-id");

    // simulate external cleanup (e.g. a tag manager) nulling out the shared namespace
    (window as any).jfLib = undefined;

    await expect(handle.pause(0)).resolves.toBeUndefined();
    await expect(handle.destroy(0)).resolves.toBeUndefined();
  });

  it("does not re-bind when called with a duplicate id", () => {
    const callback = vi.fn();
    document.body.innerHTML = '<div class="test"></div>';

    elementReady(".test", callback, "test-id");
    expect(callback).toHaveBeenCalledTimes(1);

    elementReady(".test", callback, "test-id");
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("standard handle shape", () => {
  it("exposes details with a live isListening flag", async () => {
    const handle = elementReady(".handle-test", vi.fn(), "HANDLE_1");
    expect(handle.details.id).toBe("HANDLE_1");
    expect(handle.details.selector).toBe(".handle-test");
    expect(handle.details.isListening).toBe(true);
    await handle.destroy(0);
    expect(handle.details.isListening).toBe(false);
  });
});
