/**
 * Converts a JSON object into a `FormData` object.
 *
 * This function transforms the key-value pairs of a JSON object into a `FormData` instance, suitable for use in form
 * submissions or API requests. Each key-value pair in the object is added to the `FormData` object, with values cast to
 * strings as necessary.
 *
 * @param {{ [key: string]: unknown }} json - The JSON object to convert.
 * @returns {FormData} A `FormData` instance containing all key-value pairs from the JSON object.
 */

export const parseJsonToFormData = (json: { [key: string]: unknown }) => {
  if (typeof json !== "object" || json === null || Array.isArray(json)) throw new Error("Parameter 1 must be of type object");
  const formData = new FormData();
  for (const key in json) {
    if (!Object.prototype.hasOwnProperty.call(json, key)) continue;
    const typedKey = key;
    // Ensure we only try to add properties which exist on the object
    if (Object.prototype.hasOwnProperty.call(json, typedKey)) {
      // Type cast the value to a string
      formData.append(typedKey, json[typedKey] as string);
    }
  }
  return formData;
};
