import { isDebug } from "./isDebug";

/**
 * Log level types for internal logging
 *
 * @typedef {"info" | "detail" | "success" | "warn" | "error"} LogLevel
 */
export type LogLevel = "info" | "detail" | "success" | "warn" | "error" | "none";

/**
 * Logs messages to the console with consistent formatting and color coding.
 *
 * `warn` and `error` levels route to `console.warn`/`console.error` so error-tracking tooling can see them; all other
 * levels use `console.log`.
 *
 * @param {string} message - The message to log
 * @param {LogLevel} level - The log level (info, detail, success, warn, error)
 * @param {string} id - The id of the function that the message relates to
 * @param {unknown} [data] - Optional data to log alongside the message
 */
export const log = (message: string, level: LogLevel = "info", id: string = "", data?: unknown) => {
  const styles = {
    info: "background: #61afef; color: #fff; padding: 2px 5px;",
    detail: "background: #c162de; color: #fff; padding: 2px 5px;",
    success: "background: #8cc265; color: #fff; padding: 2px 5px;",
    warn: "background: #f0a45d; color: #fff; padding: 2px 5px;",
    error: "background: #ff616e; color: #fff; padding: 2px 5px;",
    none: "background: #fff; color: #fff; padding: 2px 5px;",
  };
  const output = level === "error" ? console.error : level === "warn" ? console.warn : console.log;

  if (!!data) {
    output(`${id} %c${message}`, styles[level], data);
  } else {
    output(`${id} %c${message}`, styles[level]);
  }
};

/**
 * Creates a prefixed logger for a module instance. All output is debug-gated: nothing is written to the console unless
 * the `jf_debug=true` cookie is set. Genuine runtime errors should go through the error reporter, not this logger.
 *
 * @param {string} prefix - Prefix identifying the module/instance, e.g. `[TEST_ID] useSPA`
 * @returns {(message: string, level?: LogLevel, data?: unknown) => void} The gated logger
 */
export const createLogger =
  (prefix: string) =>
  (message: string, level: LogLevel = "info", data?: unknown) => {
    if (!isDebug()) return;
    log(message, level, prefix, data);
  };
