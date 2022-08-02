/**
 * Convert the passed JSON object into a FormData object
 * @param {Object} json The object you wish to parse
 * @returns {FormData}
 */
export var parseJsonToFormData = function (json) {
    if (typeof json !== "object")
        throw new Error("Parameter 1 must be of type object");
    var formData = new FormData();
    for (var key in json) {
        var typedKey = key;
        // Ensure we only try to add properties which exist on the object
        if (Object.prototype.hasOwnProperty.call(json, typedKey)) {
            // Type cast the value to a string
            formData.append(typedKey, json[typedKey]);
        }
    }
    return formData;
};
