import { getElement } from "../../src";
import * as helpers from "../../src/helpers/isDebug";

("use strict");

describe("getElement", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("returns the matching element", () => {
    document.body.innerHTML = `<div class="mock">hi</div>`;
    const result = getElement(".mock", "TIK_123456 mock");
    expect(result).toBeInstanceOf(HTMLElement);
    expect(result?.textContent).toBe("hi");
  });

  it("returns null when nothing matches", () => {
    expect(getElement(".missing", "TIK_123456 missing")).toBeNull();
  });

  it("scopes the query to the provided root", () => {
    document.body.innerHTML = `<div class="mock">outer</div><section><div class="mock">inner</div></section>`;
    const section = document.querySelector("section") as HTMLElement;
    expect(getElement(".mock", "TIK_123456 mock", section)?.textContent).toBe("inner");
  });

  it("logs a not-found warning when debug is enabled", () => {
    vi.spyOn(helpers, "isDebug").mockReturnValue(true);
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    getElement(".missing", "TIK_123456 missing");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0].join(" ")).toContain("not found: .missing");
    expect(spy.mock.calls[0].join(" ")).toContain("TIK_123456 missing");
  });

  it("does not log when debug is disabled", () => {
    vi.spyOn(helpers, "isDebug").mockReturnValue(false);
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    getElement(".missing", "TIK_123456 missing");
    expect(spy).not.toHaveBeenCalled();
  });
});
