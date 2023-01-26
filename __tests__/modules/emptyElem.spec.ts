import { emptyElem } from "modules";

const CHILD_COUNT = 5;
const NO_ARG_ERR = "Function requires an argument";
const INCORRECT_ARG_ERR = "Argument 1 must be a HTMLElement";

describe("emptyElem", () => {
  const appendChildren = (parent: HTMLElement, makeComments: boolean = false) => {
    if (makeComments) {
      new Array(CHILD_COUNT).fill(null).forEach((n, index) => {
        const elem = document.createTextNode(`This is text node ${index}`);
        parent.appendChild(elem);
      });
    } else {
      return new Array(CHILD_COUNT).fill(null).map((n, index) => {
        const elem = document.createElement("p");
        elem.textContent = `Item ${index}`;
        parent.appendChild(elem);
      });
    }
  };

  it("will throw without an arg being provided", () => {
    // @ts-ignore-next-line
    expect(() => emptyElem()).toThrow(NO_ARG_ERR);
  });

  it("will throw if the arg provided is not an instance of HTMLElement", () => {
    // @ts-ignore-next-line
    expect(() => emptyElem(true)).toThrow(INCORRECT_ARG_ERR);
  });

  it("will correctly empty all HTML elements from a parent", () => {
    const parent = document.createElement("div");
    appendChildren(parent, false);
    expect(parent.childElementCount).toBe(CHILD_COUNT);
    emptyElem(parent);
    expect(parent.childElementCount).toBe(0);
  });

  it("will correctly empty all text node elements from a parent", () => {
    const parent = document.createElement("div");
    appendChildren(parent, true);
    console.log(parent.innerHTML);
    expect(parent.textContent).not.toBe(null);
    expect(parent.textContent.length > 0).toBe(true);
    expect(typeof parent.textContent).toBe("string");
    emptyElem(parent);
    expect(parent.textContent).toBe("");
    expect(parent.textContent.length > 0).toBe(false);
  });
});
