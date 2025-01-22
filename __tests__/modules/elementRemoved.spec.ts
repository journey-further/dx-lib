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
    expect(() => elementRemoved("", jest.fn(), "test-id")).toThrow("elementRemoved setup failed");
    expect(() => elementRemoved(".test", null as any, "test-id")).toThrow("elementRemoved setup failed");
    expect(() => elementRemoved(".test", jest.fn(), "")).toThrow("elementRemoved setup failed");
  });

  it("validates selector format", () => {
    expect(() => elementRemoved(123 as any, jest.fn(), "test-id")).toThrow("elementRemoved setup failed");
    expect(() => elementRemoved(">>>>>>", jest.fn(), "test-id")).toThrow("elementRemoved setup failed");
  });

  it("validates conditions parameter", () => {
    expect(() => elementRemoved(".test", jest.fn(), "test-id", "not-a-function" as any)).toThrow(
      "elementRemoved setup failed"
    );
  });

  it("detects removed elements", (done) => {
    const callback = jest.fn();
    const div = document.createElement("div");
    div.className = "test";
    document.body.appendChild(div);

    elementRemoved(".test", callback, "test-id");
    document.body.removeChild(div);

    setTimeout(() => {
      try {
        expect(callback).toHaveBeenCalledWith(expect.any(Element));
        done();
      } catch (error) {
        done(error);
      }
    }, 100);
  });

  it("handles nested element removal", (done) => {
    const callback = jest.fn();
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

      setTimeout(() => {
        try {
          expect(callback).toHaveBeenCalledTimes(1);
          done();
        } catch (error) {
          done(error);
        }
      }, 100);
    }
  });

  it("respects conditions", (done) => {
    const callback = jest.fn();
    document.body.innerHTML = `
      <div class="test" data-remove="true"></div>
      <div class="test" data-remove="false"></div>
    `;

    elementRemoved(".test", callback, "test-id", (el) => el.getAttribute("data-remove") === "true");

    const elements = document.querySelectorAll(".test");
    elements.forEach((el) => document.body.removeChild(el));

    setTimeout(() => {
      try {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(Element));
        done();
      } catch (error) {
        done(error);
      }
    }, 100);
  });

  it("can be destroyed", async () => {
    const callback = jest.fn();
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

  it("handles multiple removals with same selector", (done) => {
    const callback = jest.fn();
    document.body.innerHTML = `
      <div class="test"></div>
      <div class="test"></div>
      <div class="test"></div>
    `;

    elementRemoved(".test", callback, "test-id");

    const elements = document.querySelectorAll(".test");
    elements.forEach((el) => document.body.removeChild(el));

    setTimeout(() => {
      try {
        expect(callback).toHaveBeenCalledTimes(3);
        done();
      } catch (error) {
        done(error);
      }
    }, 100);
  });

  it("can be reinitialized after destruction", async () => {
    const callback = jest.fn();
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
});
