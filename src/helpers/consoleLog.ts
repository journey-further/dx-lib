/**
 * Log level types for internal logging
 *
 * @typedef {"info" | "detail" | "success" | "warn" | "error"} LogLevel
 */
export type LogLevel = "info" | "detail" | "success" | "warn" | "error";

/**
 * Logs messages to the console with consistent formatting and color coding
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
  };

  if (!!data) {
    console.log(`${id} %c${message}`, styles[level], data);
  } else {
    console.log(`${id} %c${message}`, styles[level]);
  }
};
