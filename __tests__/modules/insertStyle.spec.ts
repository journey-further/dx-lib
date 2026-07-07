import { insertStyle } from "../../src";

const MOCK_STYLE_STRING = `.test{background: red;}`;
const MOCK_STYLE_ID = "mock-style";

describe("insertStyle", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
  });
  it("will exit if there is already an element with the ID provided so to not double add", async () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="${MOCK_STYLE_ID}">Test</div>`);
    await insertStyle(MOCK_STYLE_STRING, MOCK_STYLE_ID);
    const element = document.querySelector(`#${MOCK_STYLE_ID}`);
    expect(element?.tagName).toBe("DIV");
    expect(element?.textContent).toBe("Test");
  });

  it("will add a style element with the correct content and id", async () => {
    await insertStyle(MOCK_STYLE_STRING, MOCK_STYLE_ID);
    const style = document.querySelector(`#${MOCK_STYLE_ID}`);
    expect(style).toBeDefined();
    expect(style?.innerHTML).toBe(MOCK_STYLE_STRING);
  });

  it("does not reject for ids that are invalid CSS selectors (e.g. starting with a digit)", async () => {
    const id = "123-test";
    await expect(insertStyle(MOCK_STYLE_STRING, id)).resolves.toBeUndefined();
    const style = document.getElementById(id);
    expect(style).not.toBeNull();
    expect(style?.innerHTML).toBe(MOCK_STYLE_STRING);
  });

  it("rejects when the underlying insertion genuinely fails, instead of swallowing the error", async () => {
    const elem = document.createElement("div");
    const insertionError = new Error("insertion boom");
    vi.spyOn(elem, "insertAdjacentHTML").mockImplementation(() => {
      throw insertionError;
    });

    await expect(insertStyle(MOCK_STYLE_STRING, "some-id", { elem })).rejects.toThrow("insertion boom");
  });
});
