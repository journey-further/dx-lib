import { cookies } from "../../src";

describe("cookies", () => {
  afterEach(() => {
    // Expire every cookie written by a test
    document.cookie.split(";").forEach((pair) => {
      const name = pair.split("=")[0].trim();
      if (name) document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  });

  it("round-trips a plain value", () => {
    cookies.set("site", "leeds");
    expect(cookies.get("site")).toBe("leeds");
  });

  it("round-trips a value containing characters that need encoding", () => {
    const value = "Leeds & York; rating=5";
    cookies.set("site", value);
    expect(cookies.get("site")).toBe(value);
  });

  it("returns null for a cookie that does not exist", () => {
    expect(cookies.get("missing")).toBeNull();
  });

  it("returns the right cookie when several are set", () => {
    cookies.set("first", "one");
    cookies.set("second", "two");
    expect(cookies.get("first")).toBe("one");
    expect(cookies.get("second")).toBe("two");
  });

  it("does not match a cookie whose name merely contains the requested name", () => {
    cookies.set("site_extended", "wrong");
    expect(cookies.get("site")).toBeNull();
  });

  it("persists with an expiry when days is provided", () => {
    cookies.set("keep", "me", { days: 7 });
    expect(cookies.get("keep")).toBe("me");
  });

  it("includes the domain attribute when provided", () => {
    cookies.set("scoped", "value", { domain: "localhost" });
    expect(cookies.get("scoped")).toBe("value");
  });

  it("del removes the cookie", () => {
    cookies.set("gone", "soon");
    cookies.del("gone");
    expect(cookies.get("gone")).toBeNull();
  });
});
