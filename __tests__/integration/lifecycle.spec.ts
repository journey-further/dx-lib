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
  window.jfLib?.observers?.["1.0"]?.forEach((o) => o.observer?.disconnect());
  // @ts-expect-error test cleanup
  delete window.jfLib;
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
    expect(window.jfLib.pageChange["1.0"].pagePath).toBe("/next-page");
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
    expect(window.jfLib.pageChange["1.0"].pagePath).toBe("/?page=2#reviews");
    window.removeEventListener("jf-pagechange-1.0", pcSpy);
  });
});

describe("teardown and re-init correctness (H5, H6, H7)", () => {
  it("H5: destroy() removes listeners — no zombie re-apply on the next page change", async () => {
    const apply = vi.fn();
    const Test = useSPA("TST_000020");
    await Test.init({ apply, location: "/" });
    expect(apply).toHaveBeenCalledTimes(1);

    Test.destroy();
    expect(window.jfLib.experiments).toHaveLength(0);

    window.dispatchEvent(new Event("jf-pagechange-1.0"));
    window.dispatchEvent(new Event("jf-reinit-1.0"));
    await tick(50);
    expect(apply).toHaveBeenCalledTimes(1); // destroyed test must stay gone
  });

  it("H5: a destroy() landing while a re-apply is in flight must not resurrect isApplied", async () => {
    let call = 0;
    let resolveSecond!: () => void;
    const apply = vi.fn(() => {
      call++;
      if (call < 2) return Promise.resolve();
      return new Promise<void>((res) => (resolveSecond = res));
    });
    const Test = useSPA("TST_000024");
    await Test.init({ apply, location: "/" });
    await Test.reset();
    expect(Test.details.isApplied).toBe(false);

    // a reinit starts a second apply that stays pending while destroy() lands
    window.dispatchEvent(new Event("jf-reinit-1.0"));
    await tick(10);
    expect(call).toBe(2);
    Test.destroy();

    resolveSecond();
    await tick(10);
    expect(Test.details.isApplied).toBe(false); // the zombie apply must not write state
  });

  it("H6: the watchForRemoval cap applies per loop, resets on page change, and stops re-running the user reset", async () => {
    const apply = vi.fn();
    const reset = vi.fn();
    const Test = useSPA("TST_000021");
    await Test.init({ apply, reset, location: "/", watchForRemoval: ".watched" });
    expect(apply).toHaveBeenCalledTimes(1);

    const rerender = async () => {
      const el = document.createElement("div");
      el.className = "watched";
      document.body.appendChild(el);
      await tick(10);
      el.remove();
      await tick(30);
    };

    for (let i = 0; i < 12; i++) await rerender();

    // reapplies capped: 1 initial + 5 loop reapplies
    expect(apply.mock.calls.length).toBe(6);
    // reset fires once at the cap, then never again per removal
    expect(reset.mock.calls.length).toBe(1);

    // a page change starts a new loop: the cap must not be a per-session kill switch
    window.history.pushState({}, "", "/again");
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new Event("jf-pagechange-1.0"));
    await tick(50);
    expect(apply.mock.calls.length).toBe(7); // re-applied after page change
    await rerender();
    expect(apply.mock.calls.length).toBe(8); // watch loop live again
  });

  it("H6: a reinit also starts a new removal-watch loop — the cap must not outlive the loop", async () => {
    const apply = vi.fn();
    const reset = vi.fn();
    const Test = useSPA("TST_000025");
    await Test.init({ apply, reset, location: "/", watchForRemoval: ".watched" });

    const rerender = async () => {
      const el = document.createElement("div");
      el.className = "watched";
      document.body.appendChild(el);
      await tick(10);
      el.remove();
      await tick(30);
    };

    for (let i = 0; i < 12; i++) await rerender();
    expect(apply.mock.calls.length).toBe(6); // capped

    // SPA wipe with no URL change: a legitimate re-apply happens...
    window.dispatchEvent(new Event("jf-reinit-1.0"));
    await tick(50);
    expect(apply.mock.calls.length).toBe(7);

    // ...and the removal-watch loop must be live again, not dead until the next URL change
    await rerender();
    expect(apply.mock.calls.length).toBe(8);
  });

  it("H7: the shared jf-reinit observer honours every instance's removedNode, not just the first binder's", async () => {
    const reinitSpy = vi.fn();
    window.addEventListener("jf-reinit-1.0", reinitSpy);

    const A = useSPA("TST_000022");
    await A.init({ apply: vi.fn(), location: "/" }); // binds singleton with default MAIN

    const B = useSPA("TST_000023");
    await B.init({ apply: vi.fn(), location: "/", removedNode: "app-root" });

    document.body.appendChild(document.createElement("app-root"));
    await tick(50);
    expect(reinitSpy.mock.calls.length).toBeGreaterThanOrEqual(1); // B's node now fires

    document.body.appendChild(document.createElement("main"));
    await tick(50);
    expect(reinitSpy.mock.calls.length).toBeGreaterThanOrEqual(2); // A's node still fires

    window.removeEventListener("jf-reinit-1.0", reinitSpy);
    A.destroy();
    B.destroy();
  });
});

describe("reset teardown sweep (M1, D1)", () => {
  it("M1: elementReady re-decorates surviving elements after a reset/reapply cycle", async () => {
    const el = document.createElement("div");
    el.className = "target";
    document.body.appendChild(el);

    const cb = vi.fn();
    const apply = vi.fn(() => {
      elementReady(".target", cb, "TST_000030--decorate");
    });
    const Test = useSPA("TST_000030");
    await Test.init({ apply, location: "/" });
    await tick(60); // elementReady marks after its initial scan
    expect(cb).toHaveBeenCalledTimes(1);

    await Test.reset(); // must clear the callback AND the element's jfReady mark

    window.dispatchEvent(new Event("jf-reinit-1.0"));
    await tick(60);
    expect(apply).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledTimes(2); // surviving element re-decorated
    Test.destroy();
  });

  it("D1: customEvents subscriptions from apply() do not stack across reset/reapply cycles", async () => {
    const handler = vi.fn();
    const { emit, on } = customEvents("TST_000031");
    const apply = vi.fn(() => {
      on("basket:updated", handler); // typical build pattern: subscribe in apply()
    });
    const Test = useSPA("TST_000031");
    await Test.init({ apply, location: "/" });
    expect(apply).toHaveBeenCalledTimes(1);

    await Test.reset();
    window.dispatchEvent(new Event("jf-reinit-1.0"));
    await tick(50);
    expect(apply).toHaveBeenCalledTimes(2);

    emit("basket:updated", {});
    expect(handler).toHaveBeenCalledTimes(1); // one logical subscription, one delivery
    Test.destroy();
  });
});

describe("option handling (M3, M5, L4)", () => {
  it("M3: resizing to exactly minWidth applies the test — no boundary dead zone", async () => {
    (window as unknown as { innerWidth: number }).innerWidth = 500;
    const apply = vi.fn();
    const Test = useSPA("TST_000040");
    await Test.init({ apply, location: "/", screen: { minWidth: 601, maxWidth: 1023 } });
    expect(apply).not.toHaveBeenCalled(); // 500 < 601

    (window as unknown as { innerWidth: number }).innerWidth = 601; // exactly the documented lower bound
    window.dispatchEvent(new Event("resize"));
    await tick(200); // past the 100ms debounce
    expect(apply).toHaveBeenCalledTimes(1);
    Test.destroy();
  });

  it("M5: a case-sensitive location RegExp is used as-is, not rebuilt with forced gi flags", async () => {
    window.history.replaceState({}, "", "/products/x");
    const apply = vi.fn();
    const Test = useSPA("TST_000041");
    await Test.init({ apply, location: /\/Products\// });
    expect(apply).not.toHaveBeenCalled(); // lowercase path must not match a capital-P regex
    Test.destroy();

    const apply2 = vi.fn();
    const Test2 = useSPA("TST_000042");
    await Test2.init({ apply: apply2, location: /\/products\// });
    expect(apply2).toHaveBeenCalledTimes(1);
    Test2.destroy();
  });

  it("L4: a frozen screen options object does not make init reject", async () => {
    (window as unknown as { innerWidth: number }).innerWidth = 800;
    const apply = vi.fn();
    const Test = useSPA("TST_000043");
    const screen = Object.freeze({ minWidth: 601 });
    await expect(Test.init({ apply, location: "/", screen })).resolves.not.toThrow();
    expect(apply).toHaveBeenCalledTimes(1);
    Test.destroy();
  });
});
