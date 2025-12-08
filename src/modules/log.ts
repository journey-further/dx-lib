/**
 * Logs a warning message to the console with a formatted function name prefix.
 *
 * This utility function provides a consistent way to log warnings across the library. The warning message is prefixed
 * with the function name in square brackets, making it easier to identify the source of the warning in the console.
 *
 * @param {string} fnName - The name of the function generating the warning. This will be displayed in square brackets
 *   as a prefix to the message.
 * @param {string} message - The warning message to display.
 * @param {unknown} [data] - Optional additional data to log alongside the warning message.
 * @returns {void}
 */
export const logWarn = (fnName: string, message: string, data?: unknown) => {
  console.warn(`[${fnName}] ${message}`, data);
};
