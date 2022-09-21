import { waitFor, queryAll, getElementByXPath, findParents, generateId, getElementFromHtmlString } from "../../src";

("use strict");

const MOCK_QUERY = ".mock";

// We need to mock our timers
jest.useFakeTimers({ advanceTimers: true });
jest.spyOn(global, "setTimeout");

describe("waitFor", () => {
  // Cleanup after each test
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it("will return the truthy value", async () => {
    const callback = jest.fn().mockReturnValue(document.createElement("div"));
    const result = await waitFor(callback);
    expect(result).toBeDefined();
    expect(result instanceof HTMLElement).toBe(true);
    expect(setTimeout).toBeCalledTimes(0);
  });

  it("will call callback 20 times by default", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    await waitFor(callback, undefined, 1); // set poll to 1s as we don't care about that
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect(callback).toHaveBeenCalledTimes(20);
  });

  it("will call callback X times by when passed", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    await waitFor(callback, 50, 1); // set poll to 1s as we don't care about that
    expect(setTimeout).toHaveBeenCalledTimes(50);
    expect(callback).toHaveBeenCalledTimes(50);
  });

  it("will call timeout with the correct default poll values", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    waitFor(callback);
    for (let i = 0; i < 20; i++) {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    }
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect((setTimeout as unknown as jest.Mock).mock.calls[0][1]).toBe(200); // First recursion should be 100 + 100
    expect((setTimeout as unknown as jest.Mock).mock.calls[19][1]).toBe(2100); // Last recursion should be 2100
  });

  it("will call timeout with the correct provided poll values", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    await waitFor(callback, undefined, 1); // set poll to 1s as we dont care about that
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect((setTimeout as unknown as jest.Mock).mock.calls[0][1]).toBe(2); // First recursion should be 1 + 1
    expect((setTimeout as unknown as jest.Mock).mock.calls[19][1]).toBe(21); // Last recursion should be 20 + 1
  });
});

describe("queryAll", () => {
  it("will return a true array", () => {
    const result = queryAll(MOCK_QUERY);
    expect(Array.isArray(result)).toBe(true);
    expect(result.reduce).toBeDefined();
  });

  it("will call querySelectorAll with the provided argument", () => {
    const spy = jest.spyOn(document, "querySelectorAll");
    queryAll(MOCK_QUERY);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(MOCK_QUERY);
  });
});

describe("getElementByXPath", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  it("Will return a html element", async () => {
    document.body.insertAdjacentHTML("afterbegin", `<h2>Hello</h2>`);
    const result = getElementByXPath(`//h2[contains(string(), 'Hello')]`);
    expect(result).toBeDefined();
    expect(result instanceof HTMLElement).toBe(true);
    expect(result.textContent).toBe("Hello");
  });

  it("Will return undefined", async () => {
    document.body.insertAdjacentHTML("afterbegin", `<h2>Hello</h2>`);
    const result = getElementByXPath(`//h3[contains(string(), 'Hello')]`);
    expect(result).toBeUndefined();
  });
});

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

describe("generateId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("will return a string which starts with a letter", () => {
    expect(/^[a-z]/.test(generateId())).toBe(true);
  });

  it("will generate a new ID if the one generated starts with a number", () => {
    const ID = "1hello";
    const NEW_ID = "hello-again";
    const mockSubstring = jest.spyOn(String.prototype, "substring");
    const mockRandom = jest.spyOn(Math, "random").mockReturnValue(0.3);
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
    const mockSubstring = jest.spyOn(String.prototype, "substring");
    const mockRandom = jest.spyOn(Math, "random").mockReturnValue(0.3);
    mockSubstring.mockReturnValueOnce(ID);
    mockSubstring.mockReturnValueOnce(NEW_ID);
    global.document.body.insertAdjacentHTML("afterbegin", `<div id="${ID}">Hey</div>`);
    const output = generateId();
    expect(mockRandom).toBeCalledTimes(2);
    expect(mockSubstring).toBeCalledTimes(2);
    expect(output).toBe(NEW_ID);
  });
});

describe("getElementFromHtmlString", () => {
  it("will return the element which matches the provided selector", () => {
    const HTML = `<div class="one">hey</div><div class="two">Yo</div>`;
    const element = getElementFromHtmlString(HTML, ".one");
    expect(element instanceof HTMLElement).toBe(true);
    expect(element?.matches(".one")).toBe(true);
  });
});
