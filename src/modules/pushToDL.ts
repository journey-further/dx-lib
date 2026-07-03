declare global {
  interface Window {
    dataLayer: any[]; // eslint-disable-line
  }
}

/**
 * Pushes an event object into the website's global `dataLayer` with the specified details.
 *
 * This function is used to add tracking events to the `dataLayer` for analytics purposes. It validates the inputs and
 * then pushes an object containing the event name, action, and label into the `dataLayer`.
 *
 * @param {string} action - The ticket ID associated with the event.
 * @param {string} label - The test ID associated with the event.
 * @param {string} [event="Optimize-View"] - The name of the event. Default is `"Optimize-View"`
 */

export const pushToDL = (action: string, label: string, event = "Optimize-View"): void => {
  if (!!!action || !!!label) throw new Error("Action and label must be provided");

  if (typeof action !== "string") {
    throw new TypeError("Action must be of type string");
  }
  if (typeof label !== "string") {
    throw new TypeError("Label must be of type string");
  }
  if (typeof event !== "string") {
    throw new TypeError("Event must be of type string");
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: event,
    eventAction: action,
    eventLabel: label,
  });
};
