/**
 * Unmocked lifecycle integration suite (AUDIT.md finding L7).
 *
 * Unlike the module suites, nothing here mocks the pageChange/reInit observers — these specs run the real observers,
 * real wire events, and the real window.jfLib registries, because every High finding in AUDIT.md sat on a path the
 * mocked suite could not reach. Each describe block maps to the audit finding ids it guards.
 */
import { useSPA } from "../../src/modules/useSPA";
import { elementReady } from "../../src/modules/elementReady";
import { customEvents } from "../../src/modules/customEvents";

const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));

const cleanGlobals = () => {
  // disconnect any live observers from the previous test, then wipe all registries and DOM
  window.jfObservers?.forEach((o) => o.details?.observer?.disconnect());
  // @ts-expect-error test cleanup
  delete window.jfLib;
  // @ts-expect-error test cleanup
  delete window.jfObservers;
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  window.history.replaceState({}, "", "/");
};

beforeEach(cleanGlobals);

describe("error channel — jf-err-1.0 (H2, H3, M4)", () => {
  it("H3: isApplied only becomes true after an async apply resolves", async () => {
    let resolveApply!: () => void;
    const apply = vi.fn(() => new Promise<void>((res) => (resolveApply = res)));
    const Test = useSPA("TST_000002");
    const initPromise = Test.init({ apply, location: "/" });

    await tick();
    expect(Test.details.isApplied).toBe(false); // apply still pending

    resolveApply();
    await initPromise;
    expect(Test.details.isApplied).toBe(true);
  });

  it("H3: a rejecting async apply leaves isApplied false and reports on the wire", async () => {
    const errSpy = vi.fn();
    window.addEventListener("jf-err-1.0", errSpy);
    const apply = vi.fn(() => Promise.reject(new Error("apply blew up")));
    const Test = useSPA("TST_000003");
    await Test.init({ apply, location: "/" });

    expect(Test.details.isApplied).toBe(false);
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy.mock.calls[0][0].detail).toMatchObject({ ticket: "TST_000003", message: "apply blew up" });
    window.removeEventListener("jf-err-1.0", errSpy);
  });

  it("H3: a rejecting reset still flips isApplied/isReset and reports instead of escaping", async () => {
    const errSpy = vi.fn();
    window.addEventListener("jf-err-1.0", errSpy);
    const Test = useSPA("TST_000004");
    await Test.init({
      apply: vi.fn(),
      reset: vi.fn(() => Promise.reject(new Error("reset blew up"))),
      location: "/",
    });
    expect(Test.details.isApplied).toBe(true);

    await Test.reset(); // must not reject
    expect(Test.details.isApplied).toBe(false);
    expect(Test.details.isReset).toBe(true);
    expect(errSpy).toHaveBeenCalledTimes(1);
    window.removeEventListener("jf-err-1.0", errSpy);
  });

  it("H2: a throwing re-apply on SPA navigation dispatches jf-err-1.0 (and legacy jf-wx-err) instead of vanishing", async () => {
    const errSpy = vi.fn();
    const legacySpy = vi.fn();
    window.addEventListener("jf-err-1.0", errSpy);
    window.addEventListener("jf-wx-err", legacySpy);

    const apply = vi
      .fn()
      .mockImplementationOnce(() => undefined)
      .mockImplementation(() => {
        throw new Error("selector gone after redeploy");
      });
    const Test = useSPA("TST_000005");
    await Test.init({ apply, location: "/" });
    expect(Test.details.isApplied).toBe(true);
    expect(errSpy).not.toHaveBeenCalled();

    // SPA navigation back onto a matching page → re-apply throws
    window.dispatchEvent(new Event("jf-pagechange-1.0"));
    await tick(50);

    expect(apply).toHaveBeenCalledTimes(2);
    // scope to this test's ticket — earlier instances in this file still hold listeners until destroyed
    const mine = errSpy.mock.calls.filter((c) => c[0].detail.ticket === "TST_000005");
    expect(mine).toHaveLength(1);
    expect(mine[0][0].detail.message).toBe("selector gone after redeploy");
    expect(legacySpy.mock.calls.filter((c) => c[0].detail.ticket === "TST_000005")).toHaveLength(1); // dual dispatch
    expect(Test.details.isApplied).toBe(false); // failed re-apply must not claim applied

    window.removeEventListener("jf-err-1.0", errSpy);
    window.removeEventListener("jf-wx-err", legacySpy);
  });

  it("M4: init rejects for the awaiting author on invalid options, after reporting on the wire", async () => {
    const errSpy = vi.fn();
    window.addEventListener("jf-err-1.0", errSpy);
    const Test = useSPA("TST_000006");
    // @ts-expect-error deliberately missing apply
    await expect(Test.init({ location: "/" })).rejects.toThrow(/apply/);
    expect(errSpy).toHaveBeenCalledTimes(1);
    window.removeEventListener("jf-err-1.0", errSpy);
  });
});

describe("page-change detection (H4)", () => {
  it("dispatches jf-pagechange-1.0 on pages without meta description or canonical link", async () => {
    const pcSpy = vi.fn();
    window.addEventListener("jf-pagechange-1.0", pcSpy);
    const Test = useSPA("TST_000010");
    await Test.init({ apply: vi.fn(), location: "/" });

    // SPA navigation: pathname changes, DOM mutates — no meta/canonical anywhere on the page
    window.history.pushState({}, "", "/next-page");
    document.body.appendChild(document.createElement("div"));
    await tick(50);

    expect(pcSpy).toHaveBeenCalledTimes(1);
    expect(window.jfLib.pagePath).toBe("/next-page");
    window.removeEventListener("jf-pagechange-1.0", pcSpy);
  });

  it("detects query-string and hash navigations, not just pathname changes", async () => {
    const pcSpy = vi.fn();
    window.addEventListener("jf-pagechange-1.0", pcSpy);
    const Test = useSPA("TST_000011");
    await Test.init({ apply: vi.fn(), location: "/" });

    window.history.pushState({}, "", "/?page=2");
    document.body.appendChild(document.createElement("div"));
    await tick(50);
    expect(pcSpy).toHaveBeenCalledTimes(1);

    window.history.pushState({}, "", "/?page=2#reviews");
    document.body.appendChild(document.createElement("div"));
    await tick(50);
    expect(pcSpy).toHaveBeenCalledTimes(2);
    expect(window.jfLib.pagePath).toBe("/?page=2#reviews");
    window.removeEventListener("jf-pagechange-1.0", pcSpy);
  });
});
