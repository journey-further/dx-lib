import { insertHTML } from "../../src";
describe("insertHTML", () => {
  // Cleanup after each test
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
  });

  test("inserts HTML", () => {
    const html = `<div id="test">Hey</div>`;
    insertHTML(html, "#test", "body");
    const elem = document.querySelector("#test");
    expect(elem).toBeDefined();
    expect(elem instanceof HTMLElement).toBe(true);
  });

  test("doesn't replace duplicates when last argument is false", () => {
    const html = `<div class="test first">Hey</div>`;
    const html2 = `<div class="test second">Hey</div>`;
    document.body.insertAdjacentHTML("afterbegin", html);
    insertHTML(html2, ".test", "body", "afterbegin", false);
    const elements = document.querySelectorAll(".test");
    expect(elements.length).toBe(1);
    expect(elements[0] instanceof HTMLElement).toBe(true);
    expect(elements[0].classList.contains("first")).toBe(true);
  });

  test("replaces duplicates when last argument is true", () => {
    const html = `<div class="test first">Hey</div>`;
    const html2 = `<div class="test second">Hey</div>`;
    document.body.insertAdjacentHTML("afterbegin", html);
    insertHTML(html2, ".test", "body", "afterbegin", true);
    const elements = document.querySelectorAll(".test");
    expect(elements.length).toBe(1);
    expect(elements[0] instanceof HTMLElement).toBe(true);
    expect(elements[0].classList.contains("second")).toBe(true);
  });

  test("returns true if an element was inserted by this function", () => {
    // When replace is false
    const html1 = `<div class="test first">Hey</div>`;
    const output1 = insertHTML(html1, ".test", "body", "afterbegin", false);
    expect(output1).toBe(true);
    // When replace is true -- we will replace the element above
    const html2 = `<div class="test second">Hey</div>`;
    const output2 = insertHTML(html2, ".test", "body", "afterbegin", true);
    expect(output2).toBe(true);
  });

  test("returns false if an element was not inserted with this function", () => {
    // Can't find the target
    const html1 = `<div class="test first">Hey</div>`;
    const output1 = insertHTML(html1, ".test", "#test", "afterbegin", false);
    expect(output1).toBe(false);
    // Duplicate and replace is false
    document.body.insertAdjacentHTML("afterbegin", html1); // Add the element
    const output2 = insertHTML(html1, ".test", "body", "afterbegin", false); // Try add duplicate
    expect(output2).toBe(false);
  });
});
