import { generateId } from "../../src";

("use strict");

describe("generateId", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("will return a string which starts with a letter", () => {
    expect(/^[a-z]/.test(generateId())).toBe(true);
  });

  it("will generate a new ID if the one generated starts with a number", () => {
    const ID = "1hello";
    const NEW_ID = "hello-again";
    const mockSubstring = vi.spyOn(String.prototype, "substring");
    const mockRandom = vi.spyOn(Math, "random").mockReturnValue(0.3);
    mockSubstring.mockReturnValueOnce(ID);
    mockSubstring.mockReturnValueOnce(NEW_ID);
    const output = generateId();
    expect(mockRandom).toBeCalledTimes(2);
    expect(mockSubstring).toBeCalledTimes(2);
    expect(output).toBe(NEW_ID);
  });

  it("will generate a new ID if there is an element with the one that exists already", () => {
    const ID = "hello";
    const NEW_ID = "hello-again";
    const mockSubstring = vi.spyOn(String.prototype, "substring");
    const mockRandom = vi.spyOn(Math, "random").mockReturnValue(0.3);
    mockSubstring.mockReturnValueOnce(ID);
    mockSubstring.mockReturnValueOnce(NEW_ID);
    global.document.body.insertAdjacentHTML("afterbegin", `<div id="${ID}">Hey</div>`);
    const output = generateId();
    expect(mockRandom).toBeCalledTimes(2);
    expect(mockSubstring).toBeCalledTimes(2);
    expect(output).toBe(NEW_ID);
  });
});
