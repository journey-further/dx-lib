import { storage } from "../../src";

describe("storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe.each([
    ["local", () => storage.local, () => window.localStorage],
    ["session", () => storage.session, () => window.sessionStorage],
  ] as const)("storage.%s", (name, store, backing) => {
    it("round-trips a JSON-serialisable value", () => {
      store().set("key", { items: ["a", "b"], count: 2 });
      expect(store().get("key", {})).toEqual({ items: ["a", "b"], count: 2 });
    });

    it("returns the fallback when the key is missing", () => {
      expect(store().get("missing", "fallback")).toBe("fallback");
    });

    it("returns the fallback when the stored value is not valid JSON", () => {
      backing().setItem("junk", "not{json");
      expect(store().get("junk", [])).toEqual([]);
    });

    it("removes the key with del", () => {
      store().set("key", 1);
      store().del("key");
      expect(backing().getItem("key")).toBeNull();
    });

    it(`does not throw from get/set/del when accessing window.${name}Storage itself throws`, () => {
      const prop = name === "local" ? "localStorage" : "sessionStorage";
      vi.spyOn(window, prop, "get").mockImplementation(() => {
        throw new Error("privacy mode");
      });

      expect(store().get("key", "fallback")).toBe("fallback");
      expect(() => store().set("key", "value")).not.toThrow();
      expect(() => store().del("key")).not.toThrow();
    });

    it("does not throw when setItem throws (e.g. quota exceeded)", () => {
      vi.spyOn(backing(), "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
      expect(() => store().set("key", "value")).not.toThrow();
    });
  });

  it("local and session are independent backings", () => {
    storage.local.set("key", "local-value");
    expect(storage.session.get("key", null)).toBeNull();
  });
});
