/**
 * Checks if a value is a regular expression
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is a RegExp instance
 */
export const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp;

/**
 * Checks if a value is an array containing only strings
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is an array where every item is a string
 */
export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/**
 * Checks if a value is a string
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is a string
 */
export const isString = (value: unknown): value is string => typeof value === "string";

/**
 * Checks if a value is a number
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is a number
 */
export const isNumber = (value: unknown): value is number => typeof value === "number";

/**
 * Checks if a value is a function
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is a function
 */
export const isFunction = (value: unknown): value is Function => typeof value === "function";
