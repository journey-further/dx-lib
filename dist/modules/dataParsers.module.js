/**
 * Convert the passed JSON object into a FormData object
 * @param {Object} json The object you wish to parse
 * @returns {FormData}
 */
const parseJsonToFormData = (json) => {
    if (typeof json !== "object")
        throw new Error("Parameter 1 must be of type object");
    const formData = new FormData();
    for (const key in json) {
        if (!Object.prototype.hasOwnProperty.call(json, key))
            continue;
        const typedKey = key;
        // Ensure we only try to add properties which exist on the object
        if (Object.prototype.hasOwnProperty.call(json, typedKey)) {
            // Type cast the value to a string
            formData.append(typedKey, json[typedKey]);
        }
    }
    return formData;
};

export { parseJsonToFormData };
