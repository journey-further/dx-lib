/**
 * Push an event object into the website's global data layer with the provided info
 *
 * @param {string} event -- The event name
 * @param {string} action -- The ticket ID
 * @param {string} label -- The test ID
 */
export const pushToDL = (event = "Optimize-View", action: string, label: string): void => {
  if (!!!event || !!!label || !!!action) throw new Error("All three arguments must be provided");

  if (typeof event !== "string") {
    throw new TypeError("Event must be of type string");
  }
  if (typeof action !== "string") {
    throw new TypeError("Action must be of type string");
  }
  if (typeof label !== "string") {
    throw new TypeError("Label must be of type string");
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: event,
    eventAction: action,
    eventLabel: label,
  });
};
