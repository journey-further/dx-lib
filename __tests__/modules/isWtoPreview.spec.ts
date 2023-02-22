import { isWtoPreview } from "modules/isWtoPreview";

describe("isWtoPreview", () => {
  // Make the window writeable
  Object.defineProperty(window, "location", {
    writable: true,
    value: {
      search: "",
    },
  });
  beforeEach(() => {
    global.window.location.search = "";
    global.document.cookie = "";
  });

  it("it will return true if _wt.pid is in the url search", () => {
    global.window.location.search = "_wt.pid=someid";
    expect(isWtoPreview()).toBe(true);
  });

  it("it will return true if _wt.bdebug=true is in document.cookie", () => {
    global.document.cookie = "_wt.bdebug=true";
    expect(isWtoPreview()).toBe(true);
  });

  it("it will return false if _wt.bdebug=true is not in document.cookie and _wt.pid is not in the search", () => {
    expect(isWtoPreview()).toBe(true);
  });
});
