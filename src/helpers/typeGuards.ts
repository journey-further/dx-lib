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

/**
 * Checks if a value is an object
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is an object
 */
export const isObject = (value: unknown): value is object => typeof value === "object" && value !== null;

/**
 * Checks if a value is an array of elements
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is an array where every item is a string
 */
export const isNodeArray = (value: unknown): value is Node[] =>
  Array.isArray(value) && value.every((item) => item instanceof Node);

/**
 * Checks if a value is an nodelist of elements
 *
 * @param {unknown} value - The value to check
 * @returns {boolean} True if the value is an array where every item is a string
 */
export const isNodeList = (value: unknown): value is NodeListOf<Node> =>
  value instanceof NodeList && [...value].every((item) => item instanceof Node);

/**
 * Checks if a node is also an element
 *
 * @param {Node} value - The value to check
 * @returns {Element} True if the value is an Element
 */
export const isNodeAsElement = (value: Node): value is Element => value.nodeType === 1 && value instanceof Element;
