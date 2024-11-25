/**
 * Represents the parameters for creating an HTML element with attributes.
 *
 * This interface defines a key-value mapping where:
 *
 * - Keys represent attribute names (e.g., "id", "class", "data-attribute").
 * - Values represent the corresponding attribute values as strings.
 */
export interface CreateElementParams {
  [key: string]: string;
}

/**
 * Creates a new HTML element of the specified type with optional attributes and content.
 *
 * This function generates an HTML element based on the provided tag name (e.g., "div", "span"). If no tag name is
 * supplied, it defaults to a `<div>` element. Attributes and content can be applied via an optional `params` object.
 *
 * - If the `params` object includes an `innerHTML` key, its value will set the element's HTML content.
 * - If the `params` object includes a `textContent` key, its value will set the element's text content.
 * - Any additional object keys can also be set here - e.g. `class` or `id` to define an elements class/id, or `href` to
 *   define a link on an `a` tag
 * - Any attribute keys in `params` containing underscores (`_`) will be converted to hyphens (`-`).
 *
 * Invalid input for the `elem` parameter (e.g., non-string types or invalid tag names) will throw an error. If `params`
 * is not a valid object, it will be ignored.
 *
 * @param {string} [elem="div"] - The type of HTML element to create (e.g., "div", "span"). Default is `"div"`
 * @param {object} [params] - Optional attributes and content for the new element.
 * @returns {HTMLElement} - The newly created HTML element.
 */
export const createElement = (
  elem: keyof HTMLElementTagNameMap | undefined = "div",
  params?: CreateElementParams
): HTMLElement => {
  // Elem is not a string
  if (elem && typeof elem !== "string") throw new Error("Parameter 1 must be of type string");
  // Elem has characters other than letters
  if (elem && !/^[a-z]+$/.test(elem)) throw new Error("HTML tags can only contain letters");

  const elemType = !elem ? "div" : elem;

  const newElem: HTMLElement = document.createElement(elemType);

  // Ensure the params parameter is a true object and not an array or a falsey object
  if (typeof params === "object" && !!params && !Array.isArray(params)) {
    const attributes = Object.keys(params);
    for (let i = 0; i < attributes.length; i += 1) {
      // Check if the passed attribute matches the correct pattern
      if (/^[a-z]+((-|_){1}[a-z]+)?$/i.test(attributes[i])) {
        // If innerHTML safely set with insert adjacentHTML
        if (attributes[i] === "innerHTML") {
          newElem.insertAdjacentHTML("afterbegin", params[attributes[i]]);
        } else if (attributes[i] === "textContent") {
          newElem.textContent = params[attributes[i]];
        } else {
          // IF the attribute has an underscore hyphenate it
          const attr = attributes[i].replace("_", "-");
          // Set the attribute on the element
          newElem.setAttribute(attr, params[attributes[i]]);
        }
      }
    }
  }
  return newElem;
};
