import { isInDom } from "../../src";

describe("isInDom", () => {
  const FAKE_ID = "element";
  const getFakeDom = () => {
    const dom = `
      <html> 
      <head>
      </head>
      <body>  
          <div id="${FAKE_ID}"></div>
      </body>
      </html>
    `;
    const doc = new DOMParser().parseFromString(dom, "text/xml");
    return doc;
  };
  afterEach(() => {
    while (document?.firstChild) {
      document?.firstChild?.remove();
    }
  });

  it("Will fail if a dom element doesn't exist", async () => {
    // Create an element
    const element = undefined;
    // Check if it is in the dom
    expect(isInDom(element)).toBe(false);
  });

  it("Will fail if a dom element exists but not in the dom provided", async () => {
    const fakeDom = getFakeDom();
    // Create an element
    const element = document.createElement("div");
    // Check if it is in the dom
    expect(isInDom(element, fakeDom)).toBe(false);
  });

  it("Will pass if a dom element exists in the dom provided", async () => {
    const fakeDom = getFakeDom();
    // Create an element
    const element = fakeDom.querySelector(`#${FAKE_ID}`);
    // Check if it is in the dom
    expect(isInDom(element, fakeDom)).toBe(true);
  });

  it("Will fail if a dom element exists but not in the dom", async () => {
    // Create an element
    const element = document.createElement("div");
    // Check if it is in the dom
    expect(isInDom(element)).toBe(false);
  });

  it("Will pass if a dom does exist", async () => {
    // Create an element
    const element = document.createElement("div");
    document.append(element);
    // Check if it is in the dom
    expect(isInDom(element)).toBe(true);
  });
});
