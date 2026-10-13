/**
 * Head-execution integration suite: a bundle can run at document-start, before `<body>` (or even `<html>`) exists.
 *
 * Nothing here mocks the observers. Each spec removes part of the document, calls the helper, then restores the
 * document and checks the helper still does its job.
 */
import { useSPA } from "../../src/modules/useSPA";
import { elementReady } from "../../src/modules/elementReady";
import { elementUpdated } from "../../src/modules/elementUpdated";
import { elementRemoved } from "../../src/modules/elementRemoved";
import { insertStyle } from "../../src/modules/insertStyle";

const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));

const html = document.documentElement;

const restoreDocument = () => {
  if (!document.documentElement) document.appendChild(html);
  if (!document.body) document.documentElement.appendChild(document.createElement("body"));
};

const cleanGlobals = () => {
  // disconnect any live observers from the previous test, then wipe all registries and DOM
  window.jfLib?.observers?.["1.0"]?.forEach((o) => o.observer?.disconnect());
  // @ts-expect-error test cleanup
  delete window.jfLib;
  restoreDocument();
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  window.history.replaceState({}, "", "/");
};

const removeBody = () => {
  document.documentElement.removeChild(document.body);
  expect(document.body).toBeNull();
};

const addBody = (markup = "") => {
  const body = document.createElement("body");
  body.innerHTML = markup;
  document.documentElement.appendChild(body);
};

beforeEach(cleanGlobals);
afterAll(cleanGlobals);

describe("no <html> yet", () => {
  it("useSPA init does not throw, enters the registry, and applies once the document exists", async () => {
    document.removeChild(html);
    expect(document.documentElement).toBeNull();

    const apply = vi.fn();
    const init = useSPA("TST_HEAD01").init({ apply, location: /.*/ });
    expect(window.jfLib.experiments.some((t) => t.details.id === "TST_HEAD01")).toBe(true);

    await tick(150);
    restoreDocument();
    await expect(init).resolves.not.toThrow();
    await tick(150);

    expect(apply).toHaveBeenCalledTimes(1);
    expect(window.jfLib.observers["1.0"].find((o) => o.ticketId === "pageChange--1.0")?.isObserving).toBe(true);
    expect(window.jfLib.observers["1.0"].find((o) => o.ticketId === "reInit--1.0")?.isObserving).toBe(true);
  });

  it("the page-change watcher still detects navigation once bound late", async () => {
    document.removeChild(html);
    const apply = vi.fn();
    const init = useSPA("TST_HEAD02").init({ apply, location: "/target" });
    await tick(150);
    restoreDocument();
    await init;
    await tick(150);
    expect(apply).not.toHaveBeenCalled();

    window.history.pushState({}, "", "/target");
    document.body.appendChild(document.createElement("div"));
    await tick(150);
    expect(apply).toHaveBeenCalledTimes(1);
  });
});

describe("no <body> yet", () => {
  it("useSPA enters the registry and applies once the body exists", async () => {
    removeBody();
    const apply = vi.fn();
    const init = useSPA("TST_HEAD03").init({ apply, location: /.*/, style: ".x{color:red}", watchForRemoval: ".foo" });
    expect(window.jfLib.experiments.some((t) => t.details.id === "TST_HEAD03")).toBe(true);
    await tick(150);
    addBody('<div class="foo"></div>');
    await init;
    await tick(150);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(document.getElementById("TST_HEAD03--style")).not.toBeNull();
  });

  it("elementReady fires for an element that arrives with the body", async () => {
    removeBody();
    const cb = vi.fn();
    elementReady(".target", cb, "TST_HEAD04");
    await tick();
    addBody('<div class="target"></div>');
    await tick();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("elementReady fires for an element added after the body", async () => {
    removeBody();
    const cb = vi.fn();
    elementReady(".target", cb, "TST_HEAD05");
    await tick();
    addBody();
    await tick();
    document.body.insertAdjacentHTML("beforeend", '<div class="target"></div>');
    await tick();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("elementUpdated and elementRemoved bind without throwing", () => {
    removeBody();
    expect(() => elementUpdated(".u", vi.fn(), "TST_HEAD06", { attributes: true })).not.toThrow();
    expect(() => elementRemoved(".r", vi.fn(), "TST_HEAD07")).not.toThrow();
  });

  it("insertStyle waits for the body", async () => {
    removeBody();
    const inserted = insertStyle(".a{}", "TST_HEAD08");
    await tick(150);
    addBody();
    await inserted;
    expect(document.getElementById("TST_HEAD08")).not.toBeNull();
  });
});
