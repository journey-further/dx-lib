/** Versioned error wire event, matching the `jf-pagechange-1.0`/`jf-reinit-1.0` family */
export const ERROR_EVENT = "jf-err-1.0";
/** @deprecated Legacy wire name, dual-dispatched for one deprecation window (canary tool). Removed next major. */
export const LEGACY_ERROR_EVENT = "jf-wx-err";

/**
 * Detail payload dispatched with the error wire event
 *
 * @property {string} ticket - The experiment/test id the error belongs to
 * @property {string} message - Human-readable error message
 * @property {Error} [errorObject] - The original Error, when one exists
 * @property {string} [variant] - The experiment variant, when known
 * @property {boolean} [malformed] - True when the report itself had invalid experiment data
 */
export interface JfErrorDetail {
  ticket: string;
  message: string;
  errorObject?: Error;
  variant?: string;
  malformed?: boolean;
}

/**
 * The library's non-throwing error channel. Dispatches the error wire event best-effort, logs via `console.warn`, and
 * never propagates — safe to call from any lifecycle path, including other error paths.
 *
 * @param {string} ticket - The experiment/test id the error belongs to
 * @param {string | Error | unknown} err - The error to report
 * @param {object} [extra] - Optional extra fields for the event detail
 * @param {string} [extra.variant] - The experiment variant, when known
 * @param {boolean} [extra.malformed] - True when the report itself had invalid experiment data
 */
export const reportError = (ticket: string, err: unknown, extra?: { variant?: string; malformed?: boolean }): void => {
  try {
    const message = err instanceof Error ? err.message : typeof err === "string" && !!err ? err : "unknown error";
    console.warn(`${ticket}: ${message}`);
    if (err instanceof Error && err.stack) console.warn(err.stack);

    const detail: JfErrorDetail = {
      ticket,
      message,
      errorObject: err instanceof Error ? err : undefined,
      ...extra,
    };
    window.dispatchEvent(new CustomEvent(ERROR_EVENT, { detail }));
    window.dispatchEvent(new CustomEvent(LEGACY_ERROR_EVENT, { detail }));

    if (err instanceof Error && err.cause) {
      console.warn(`The above error had the following cause: ${JSON.stringify(err.cause)}`);
    }
  } catch {
    // the reporter must never throw — an error channel that can fail destroys the report
  }
};
