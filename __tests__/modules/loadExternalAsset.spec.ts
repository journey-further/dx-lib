import { loadExternalAsset } from "../../src";

const SCRIPT_URL = "https://cdn.example.com/lib.min.js";
const STYLE_URL = "https://cdn.example.com/lib.min.css";

describe("loadExternalAsset", () => {
  afterEach(() => {
    while (document.head.firstChild) {
      document.head.firstChild.remove();
    }
  });

  it("injects a script into head and resolves true on load", async () => {
    const promise = loadExternalAsset(SCRIPT_URL, "script");
    const script = document.head.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    expect(script).not.toBeNull();
    script?.dispatchEvent(new Event("load"));
    await expect(promise).resolves.toBe(true);
  });

  it("injects a stylesheet link into head and resolves true on load", async () => {
    const promise = loadExternalAsset(STYLE_URL, "style");
    const link = document.head.querySelector<HTMLLinkElement>(`link[href="${STYLE_URL}"]`);
    expect(link).not.toBeNull();
    expect(link?.rel).toBe("stylesheet");
    link?.dispatchEvent(new Event("load"));
    await expect(promise).resolves.toBe(true);
  });

  it("resolves false on load error instead of rejecting", async () => {
    const promise = loadExternalAsset(SCRIPT_URL, "script");
    const script = document.head.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    script?.dispatchEvent(new Event("error"));
    await expect(promise).resolves.toBe(false);
  });

  it("resolves true without injecting when a matching tag already exists", async () => {
    document.head.insertAdjacentHTML("beforeend", `<script src="${SCRIPT_URL}"></script>`);
    await expect(loadExternalAsset(SCRIPT_URL, "script")).resolves.toBe(true);
    expect(document.head.querySelectorAll(`script[src="${SCRIPT_URL}"]`)).toHaveLength(1);
  });

  it("resolves true without injecting when checkExisting returns true", async () => {
    const checkExisting = vi.fn(() => true);
    await expect(loadExternalAsset(SCRIPT_URL, "script", { checkExisting })).resolves.toBe(true);
    expect(checkExisting).toHaveBeenCalled();
    expect(document.head.querySelector(`script[src="${SCRIPT_URL}"]`)).toBeNull();
  });

  it("injects when checkExisting returns false and no matching tag exists", async () => {
    const promise = loadExternalAsset(SCRIPT_URL, "script", { checkExisting: () => false });
    const script = document.head.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    expect(script).not.toBeNull();
    script?.dispatchEvent(new Event("load"));
    await expect(promise).resolves.toBe(true);
  });
});
