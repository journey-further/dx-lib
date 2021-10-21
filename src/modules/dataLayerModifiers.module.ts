export const pushToDL = (
  event: string = "Optimize-View",
  action: string,
  label: string
): void => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: event,
    eventAction: action,
    eventLabel: label,
  });
};
