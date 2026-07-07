import { createLogger, log } from "../../src/helpers/consoleLog";

describe("consoleLog", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    document.cookie = "jf_debug=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    vi.restoreAllMocks();
  });

  it("routes warn and error levels to console.warn/console.error, the rest to console.log", () => {
    log("a warning", "warn", "[T] mod");
    expect(console.warn).toHaveBeenCalledTimes(1);

    log("an error", "error", "[T] mod");
    expect(console.error).toHaveBeenCalledTimes(1);

    log("plain info", "info", "[T] mod");
    log("a detail", "detail", "[T] mod");
    log("a success", "success", "[T] mod");
    log("nothing", "none", "[T] mod");
    expect(console.log).toHaveBeenCalledTimes(4);
  });

  it("appends optional data to the output", () => {
    const data = { key: "value" };
    log("with data", "info", "[T] mod", data);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("with data"), expect.any(String), data);

    log("without data", "info", "[T] mod");
    expect(console.log).toHaveBeenLastCalledWith(expect.stringContaining("without data"), expect.any(String));
  });

  it("createLogger is silent without the jf_debug cookie", () => {
    const logger = createLogger("[T] mod");
    logger("hidden", "info");
    logger("hidden too", "error");
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("createLogger logs when the jf_debug cookie is set, defaulting to info level", () => {
    document.cookie = "jf_debug=true";
    const logger = createLogger("[T] mod");
    logger("visible");
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("visible"), expect.any(String));

    logger("visible warning", "warn", { extra: 1 });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("visible warning"),
      expect.any(String),
      expect.objectContaining({ extra: 1 })
    );
  });
});
