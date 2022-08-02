import { insertHTML } from "../../src";
describe("insertHTML", function () {
    // Cleanup after each test
    afterEach(function () {
        while (document.body.firstChild) {
            document.body.firstChild.remove();
        }
    });
    test("inserts HTML", function () {
        var html = "<div id=\"test\">Hey</div>";
        insertHTML(html, "#test", "body");
        var elem = document.querySelector("#test");
        expect(elem).toBeDefined();
        expect(elem instanceof HTMLElement).toBe(true);
    });
    test("doesn't replace duplicates when last argument is false", function () {
        var html = "<div class=\"test first\">Hey</div>";
        var html2 = "<div class=\"test second\">Hey</div>";
        document.body.insertAdjacentHTML("afterbegin", html);
        insertHTML(html2, ".test", "body", "afterbegin", false);
        var elements = document.querySelectorAll(".test");
        expect(elements.length).toBe(1);
        expect(elements[0] instanceof HTMLElement).toBe(true);
        expect(elements[0].classList.contains("first")).toBe(true);
    });
    test("replaces duplicates when last argument is true", function () {
        var html = "<div class=\"test first\">Hey</div>";
        var html2 = "<div class=\"test second\">Hey</div>";
        document.body.insertAdjacentHTML("afterbegin", html);
        insertHTML(html2, ".test", "body", "afterbegin", true);
        var elements = document.querySelectorAll(".test");
        expect(elements.length).toBe(1);
        expect(elements[0] instanceof HTMLElement).toBe(true);
        expect(elements[0].classList.contains("second")).toBe(true);
    });
    test("returns true if an element was inserted by this function", function () {
        // When replace is false
        var html1 = "<div class=\"test first\">Hey</div>";
        var output1 = insertHTML(html1, ".test", "body", "afterbegin", false);
        expect(output1).toBe(true);
        // When replace is true -- we will replace the element above
        var html2 = "<div class=\"test second\">Hey</div>";
        var output2 = insertHTML(html2, ".test", "body", "afterbegin", true);
        expect(output2).toBe(true);
    });
    test("returns false if an element was not inserted with this function", function () {
        // Can't find the target
        var html1 = "<div class=\"test first\">Hey</div>";
        var output1 = insertHTML(html1, ".test", "#test", "afterbegin", false);
        expect(output1).toBe(false);
        // Duplicate and replace is false
        document.body.insertAdjacentHTML("afterbegin", html1); // Add the element
        var output2 = insertHTML(html1, ".test", "body", "afterbegin", false); // Try add duplicate
        expect(output2).toBe(false);
    });
});
