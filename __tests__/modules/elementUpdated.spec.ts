import { elementUpdated } from "../../src/modules/elementUpdated";

describe("elementUpdated", () => {
  beforeEach(() => {
    // Disconnect observers BEFORE resetting state to prevent stale callbacks
    window.jfObservers?.forEach((obs) => obs.observer?.disconnect());
    window.jfObservers = [];
    window.jfLib = { elementUpdated: {} };
    document.body.innerHTML = "";
  });

  it("validates input parameters", () => {
    expect(() => elementUpdated("", vi.fn(), "test-id", { attributes: true })).toThrow("elementUpdated setup failed");
    expect(() => elementUpdated(".test", null as any, "test-id", { attributes: true })).toThrow(
      "elementUpdated setup failed"
    );
    expect(() => elementUpdated(".test", vi.fn(), "", { attributes: true })).toThrow("elementUpdated setup failed");
  });

  it("validates selector format", () => {
    expect(() => elementUpdated(123 as any, vi.fn(), "test-id", { attributes: true })).toThrow(
      "elementUpdated setup failed"
    );
    expect(() => elementUpdated(">>>>>>", vi.fn(), "test-id", { attributes: true })).toThrow(
      "elementUpdated setup failed"
    );
  });

  it("validates options parameter", () => {
    expect(() =>
      elementUpdated(".test", vi.fn(), "test-id", { attributes: false, characterData: false, textContent: false })
    ).toThrow("elementUpdated setup failed");

    expect(() => elementUpdated(".test", vi.fn(), "test-id", { attributeFilter: [] } as any)).toThrow(
      "elementUpdated setup failed"
    );

    expect(() => elementUpdated(".test", vi.fn(), "test-id", { attributeFilter: 123 } as any)).toThrow(
      "elementUpdated setup failed"
    );
  });

  it("validates conditions parameter", () => {
    expect(() => elementUpdated(".test", vi.fn(), "test-id", { attributes: true }, "not-a-function" as any)).toThrow(
      "elementUpdated setup failed"
    );
  });

  it("detects attribute changes", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    elementUpdated(".test", callback, "test-id", { attributes: true, attributeFilter: ["data-test"] });
    div.setAttribute("data-test", "value");

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("respects attribute filter", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    elementUpdated(".test", callback, "test-id", { attributes: true, attributeFilter: ["data-test"] });

    // This should not trigger the callback
    div.setAttribute("data-other", "value");

    // This should trigger the callback
    div.setAttribute("data-test", "value");

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("detects text content changes", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    elementUpdated(".test", callback, "test-id", { textContent: true });
    div.textContent = "New content";

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("detects character data changes", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    // First set up the observer
    elementUpdated(".test", callback, "test-id", { characterData: true });

    // Wait for observer to be initialized
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create and add text node after observer is initialized
    const text = document.createTextNode("Initial text");
    div.appendChild(text);

    // Wait a bit then change the text
    await new Promise((resolve) => setTimeout(resolve, 100));
    text.data = "Updated text";

    // Check the result
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("respects conditions", async () => {
    const callback = vi.fn();
    document.body.innerHTML = `
      <div class="test" data-update="true"></div>
      <div class="test" data-update="false"></div>
    `;

    elementUpdated(
      ".test",
      callback,
      "test-id",
      { attributes: true },
      (el) => el.getAttribute("data-update") === "true"
    );

    const elements = document.querySelectorAll(".test");
    elements.forEach((el) => el.setAttribute("data-test", "value"));

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("can be destroyed", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    const { destroy } = elementUpdated(".test", callback, "test-id", { attributes: true });

    // Wait for observer to be initialized
    await new Promise((resolve) => setTimeout(resolve, 100));
    await destroy();

    div.setAttribute("data-test", "value");
    // Wait for potential mutation observer
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(callback).not.toHaveBeenCalled();
  });

  it("can be reinitialized after destruction", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    const { destroy, init } = elementUpdated(".test", callback, "test-id", { attributes: true });

    // Wait for observer to be initialized
    await new Promise((resolve) => setTimeout(resolve, 100));
    await destroy();

    // Wait a bit after destruction
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Reinitialize and wait for setup
    init();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Update element
    div.setAttribute("data-test", "value");

    // Wait longer for mutation observer
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(callback).toHaveBeenCalledWith(expect.any(Element));
  });

  it("handles multiple updates to same element", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    elementUpdated(".test", callback, "test-id", { attributes: true });

    div.setAttribute("data-test1", "value1");
    div.setAttribute("data-test2", "value2");
    div.setAttribute("data-test3", "value3");

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("does not re-bind when called with a duplicate id", () => {
    const callback = vi.fn();
    elementUpdated(".test", callback, "test-id", { attributes: true });
    expect(() => elementUpdated(".test", callback, "test-id", { attributes: true })).not.toThrow();
  });

  it("validates missing options parameter", () => {
    expect(() => elementUpdated(".test", vi.fn(), "test-id", null as any)).toThrow("elementUpdated setup failed");
    expect(() => elementUpdated(".test", vi.fn(), "test-id", "not-object" as any)).toThrow("elementUpdated setup failed");
  });

  it("ignores attribute mutations when attributes option is not set", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    elementUpdated(".test", callback, "test-id", { textContent: true });
    div.setAttribute("data-ignored", "value");

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).not.toHaveBeenCalled();
  });

  it("ignores textContent mutations when textContent option is not set", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    // Only attributes enabled — textContent mutations must be ignored
    elementUpdated(".test", callback, "test-id", { attributes: true });

    const text = document.createTextNode("New content");
    div.appendChild(text);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).not.toHaveBeenCalled();
  });

  it("ignores characterData mutations when characterData option is not set", async () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    div.className = "test";
    // Pre-populate the text node so no childList mutation fires when the observer is active
    const text = document.createTextNode("initial");
    div.appendChild(text);
    document.body.appendChild(div);

    // Only attributes enabled — characterData mutations must be ignored
    elementUpdated(".test", callback, "test-id", { attributes: true });

    await new Promise((resolve) => setTimeout(resolve, 50));
    text.data = "changed";

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("standard handle shape", () => {
  it("exposes details and pause with a live isListening flag", async () => {
    const handle = elementUpdated(".handle-test", vi.fn(), "HANDLE_3", { attributes: true });
    expect(handle.details.isListening).toBe(true);
    await handle.pause(0);
    expect(handle.details.isListening).toBe(false);
  });
});
