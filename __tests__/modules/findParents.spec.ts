import { findParents } from "../../src";

("use strict");

describe("findParents", () => {
  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("Will return a html element", () => {
    const div = document.createElement("div");
    const h2 = document.createElement("h2");
    div.classList.add("container");
    div.insertAdjacentElement("beforeend", h2);
    h2.textContent = "Hello";
    const result = findParents(h2, ".container");
    expect(result).toBeDefined();
    expect(result instanceof HTMLElement).toBe(true);
    expect(result?.textContent).toBe("Hello");
  });

  it("Will return null", () => {
    const h2 = document.createElement("h2");
    h2.textContent = "Hello";
    const result = findParents(h2, "container");
    expect(result).toBeNull();
  });

  it("Will return null with wrong attribute", () => {
    const div = document.createElement("div");
    const h2 = document.createElement("h2");
    div.setAttribute("class", "container");
    div.insertAdjacentElement("beforeend", h2);
    h2.textContent = "Hello";
    const result = findParents(h2, "#container");
    expect(result).toBeNull();
  });
});
