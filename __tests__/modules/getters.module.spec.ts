import { waitFor, getElementByXPath, findParents } from "../../src";

("use strict");

// We need to mock our timers
jest.useRealTimers();
jest.spyOn(global, "setTimeout");
jest.setTimeout(100000);

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
    await waitFor(callback, undefined, 1); // set poll to 1s as we dont care about that
    expect(setTimeout).toHaveBeenCalledTimes(20);
    expect(callback).toHaveBeenCalledTimes(20);
  });

  it("will call callback X times by when passed", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    await waitFor(callback, 50, 1); // set poll to 1s as we dont care about that
    expect(setTimeout).toHaveBeenCalledTimes(50);
    expect(callback).toHaveBeenCalledTimes(50);
  });

  it("will call timeout with the correct default poll values", async () => {
    const callback = jest.fn().mockReturnValue(undefined);
    await waitFor(callback); // set poll to 1s as we dont care about that
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


describe("Get Element By XPath", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  it('Will return a html element', async () => {
    document.body.insertAdjacentHTML("afterbegin", `<h2>Hello</h2>`);
      const result = getElementByXPath(`//h2[contains(string(), 'Hello')]`);
      expect(result).toBeDefined()
      expect(result instanceof HTMLElement).toBe(true)
      expect(result.textContent).toBe("Hello")
  });

  it("Will return undefined", async() => {
    document.body.insertAdjacentHTML("afterbegin", `<h2>Hello</h2>`);
    const result = getElementByXPath(`//h3[contains(string(), 'Hello')]`);
    expect(result).toBeUndefined()
  });
});

describe("Find parents by ClassName", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  it("Will return a html element", async () => {
    // document.body.insertAdjacentHTML("afterbegin", `<div class="container"><h2>Hello</h2></div>`);

    const div = document.createElement('div');
    const h2 = document.createElement('h2');
    div.classList.add('container');
    div.insertAdjacentElement('beforeend', h2);
    h2.textContent = 'Hello';


    const result = findParents(h2, 'container');
    expect(result).toBeDefined()
    expect(result instanceof HTMLElement).toBe(true)
    expect(result?.textContent).toBe("Hello")
  });

  it("Will return null", async() => {
    const h2 = document.createElement('h2');
    h2.textContent = 'Hello';
    const result = findParents(h2, 'container');
    expect(result).toBeNull();
  });

  it("Will return null with wrong attribute", async () => {

    const div = document.createElement('div');
    const h2 = document.createElement('h2');
    div.setAttribute('class', 'container');
    div.insertAdjacentElement('beforeend', h2);
    h2.textContent = 'Hello';

    const result = findParents(h2,'container', 'id');
    expect(result).toBeNull();

  });

});
