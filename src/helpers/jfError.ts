/** Error codes shared by every JfError the library throws */
export type JfErrorCode =
  | "INVALID_ID"
  | "MISSING_OPTION"
  | "INVALID_TYPE"
  | "INVALID_SELECTOR"
  | "INVALID_OPTIONS"
  | "RUNTIME_ERROR";

/** An Error carrying the library's standard machine-readable code */
export type JfErrorInstance = Error & { code: JfErrorCode };

/**
 * Creates the library's standard coded error — a plain `Error` (so every consumer's instanceof/catch logic works)
 * named `JfError`, carrying a machine-readable `code` and an optional `cause`. The one error shape thrown by all
 * modules: the message always contains the human-readable reason, never a generic placeholder.
 *
 * @param {JfErrorCode} code - Machine-readable error code
 * @param {string} message - Human-readable reason
 * @param {unknown} [details] - Optional cause attached as `error.cause`
 * @returns {JfErrorInstance} The coded error, ready to throw
 */
export const jfError = (code: JfErrorCode, message: string, details?: unknown): JfErrorInstance => {
  const err = (details === undefined ? new Error(message) : new Error(message, { cause: details })) as JfErrorInstance;
  err.name = "JfError";
  err.code = code;
  return err;
};
