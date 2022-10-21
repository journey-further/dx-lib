/**
 * Convert the passed JSON object into a FormData object
 *
 * @param {object} json The object you wish to parse
 * @returns {FormData} A FormData instance with all the data from the provided json
 */
export const parseJsonToFormData = (json: { [key: string]: unknown }) => {
  if (typeof json !== "object") throw new Error("Parameter 1 must be of type object");
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
