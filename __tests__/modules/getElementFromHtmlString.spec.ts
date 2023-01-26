import { getElementFromHtmlString } from "../../src";

describe("getElementFromHtmlString", () => {
  it("will return the element which matches the provided selector", () => {
    const HTML = `<div class="one">hey</div><div class="two">Yo</div>`;
    const element = getElementFromHtmlString(HTML, ".one");
    expect(element instanceof HTMLElement).toBe(true);
    expect(element?.matches(".one")).toBe(true);
  });
});
