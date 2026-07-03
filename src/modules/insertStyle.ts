import { waitFor } from "./waitFor";

/**
 * Inserts a `<style>` element containing the provided CSS string into a specified element or the document body.
 *
 * This function ensures that duplicate `<style>` elements are not added by checking for an existing element with the
 * specified ID. If a target element is not provided, the `<style>` element is added to the `document.body`. If an
 * insertion position is not specified, it defaults to `"beforeend"`.
 *
 * @param {string} style - The CSS string to include in the `<style>` element.
 * @param {string} id - A unique ID to assign to the `<style>` element, ensuring no duplicates are added.
 * @param {object} [options] - Configuration options for the insertion.
 * @param {"beforebegin" | "afterbegin" | "beforeend" | "afterend"} [options.position="beforeend"] - The position where
 *   the `<style>` element should be inserted. Default is `"beforeend"`
 * @param {HTMLElement} [options.elem] - The element to insert the `<style>` element into. Defaults to `document.body`.
 * @returns {Promise<void>} Resolves when the `<style>` element is successfully inserted.
 */

export const insertStyle = async (
  style: string,
  id: string,
  options?: {
    position?: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
    elem?: HTMLElement;
  }
): Promise<void> => {
  // Generate our HTML
  const styleElem = `<style id="${id}">${style.toString()}</style>`;
  // Get our insert position
  const insertPosition = options?.position ? options.position : "beforeend";

  // Exit if an element already exists with this ID (getElementById does no selector parsing, so
  // ids that aren't valid CSS selectors - e.g. starting with a digit - are handled correctly)
  if (!!document.getElementById(id)) return;

  // If an element was passed
  if (options?.elem) {
    options.elem.insertAdjacentHTML(insertPosition, styleElem);
  } else {
    // default to document.body
    // NOTE: @samrenfrew added waitFor here to ensure that the body exists before we try to insert into it - fixes some errors with this function
    await waitFor(() => !!document.body);
    document.body.insertAdjacentHTML(insertPosition, styleElem);
  }
};
