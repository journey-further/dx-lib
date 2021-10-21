export const pushToDL = (event = "Optimize-View", action, label) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: event,
        eventAction: action,
        eventLabel: label,
    });
};
