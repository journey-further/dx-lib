import { docReady, isInDom } from "../../src";

const DEFAULT_TIMEOUT = 200;
const DEFAULT_ATTEMPTS = 10;

describe("docReady", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it("will return true if the document.readyState param is complete", async () => {
    jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "complete",
      configurable: true,
    });
    expect(await docReady()).toBe(true);
    expect(setTimeout).toHaveBeenCalledTimes(0);
  });

  it("will try maxAttempts times before returning false is readyState is not complete", async () => {
    jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "not-complete",
      configurable: true,
    });
    // Store our promise
    const promise = docReady(1);
    // Fast forward the timers
    jest.advanceTimersByTime(200);
    // Resolve the promise
    await promise;
    // Check set timeout
    expect(setTimeout).toBeCalledTimes(1);
  });

  it("will stop trying and return true when the readyState is complete", async () => {
    jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "not-complete",
      configurable: true,
    });
    const promise = docReady(5);
    // iterate twice
    for (let i = 0; i < 2; i++) {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    }
    // make the readyState complete
    Object.defineProperty(document, "readyState", {
      value: "complete",
      configurable: true,
    });
    // Move forward
    jest.advanceTimersByTime(200);
    await Promise.resolve();
    // Resolve our promise
    const result = await promise;
    expect(setTimeout).toBeCalledTimes(3);
    expect(result).toBe(true);
  });

  it("will default to 10 attempts", async () => {
    jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "not-complete",
      configurable: true,
    });
    // Store our promise
    const promise = docReady();
    // Fast forward the timers 15 times to try and force more attempts
    for (let i = 0; i < 15; i++) {
      jest.advanceTimersByTime(DEFAULT_TIMEOUT);
      await Promise.resolve();
    }
    // Resolve the promise
    await promise;
    // Check set timeout calls, they should be 10
    expect(setTimeout).toBeCalledTimes(DEFAULT_ATTEMPTS);
  });

  it("will have a default timeout of 200ms", async () => {
    const spy = jest.spyOn(global, "setTimeout");
    Object.defineProperty(document, "readyState", {
      value: "not-complete",
      configurable: true,
    });
    // Store our promise
    const promise = docReady(1);
    jest.advanceTimersByTime(DEFAULT_TIMEOUT);
    await Promise.resolve();
    await promise;
    expect(spy.mock.calls[0][1]).toBe(DEFAULT_TIMEOUT);
  });
});

describe("isInDom", () => {
  /**
   * We will want a function here to empty the DOM afterEach test.
   *
   * Conveniently there is a helper function called `afterEach` which will run after every test.
   *
   * It must be placed within this describe block so you can put it directly beneath this comment block.
   *
   * The function is:
   *
   * AfterEach(() => { // The stuff you want to do after each test // This is where you want to empty the dom });
   */
  it("Will fail if a dom element doesn't exist", async () => {
    /**
     * For these tests we do not need to spoof a dom as the environment set in the Jest config is jsdom This means all
     * the native dom methods should be available for us in the global scope and the tests, when run, are run with the
     * dom from this module.
     *
     * I have rewritten this test to give you an example of what I mean and you can apply this to the other tests in the
     * page.
     *
     * As you are allowing a dom to be passed to the function you will need to add another test to see if the test will
     * correctly use the provided dom over the global dom. For that you will need to use your spoofed dom.
     *
     * Let me know if you need more clarification bro :)
     */

    /*const dom = `
      <html> 
      <head>
      </head>
      <body>  
          <div id="element"></div>
      </body>
      </html>
    `;*/
    //const doc = new DOMParser().parseFromString(dom, "text/xml");
    //const element = doc.querySelector("#element").cloneNode(true);
    //const check = isInDom(element, doc);
    //expect(check).toBe(false);

    // Create an element
    const element = document.createElement("div");

    // Check if it is in the dom
    expect(isInDom(element)).toBe(false);
  });

  it("Will pass if a dom does exist", async () => {
    const dom = `
      <html> 
      <head>
      </head>
      <body>  
          <div id="element"></div>
      </body>
      </html>
    `;

    const doc = new DOMParser().parseFromString(dom, "text/xml");
    const element = doc.querySelector("#element");

    const check = isInDom(element, doc);
    expect(check).toBe(true);
  });
});
