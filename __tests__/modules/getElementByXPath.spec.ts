import { getElementByXPath } from "../../src";

("use strict");

describe("getElementByXPath", () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  it("Will return a html element", async () => {
    document.body.insertAdjacentHTML("afterbegin", `<h2>Hello</h2>`);
    const result = getElementByXPath(`//h2[contains(string(), 'Hello')]`);
    expect(result).toBeDefined();
    expect(result instanceof HTMLElement).toBe(true);
    expect(result.textContent).toBe("Hello");
  });

  it("Will return null when no match is found", async () => {
    document.body.insertAdjacentHTML("afterbegin", `<h2>Hello</h2>`);
    const result = getElementByXPath(`//h3[contains(string(), 'Hello')]`);
    expect(result).toBeNull();
  });
});
