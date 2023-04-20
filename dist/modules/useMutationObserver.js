/**
 * Scoped mutation observer which will prevent itself from re-adding and will utilise a globally scoped jfObservers
 * array on the window object.
 *
 * Using this will allow the WTO tag to remove all active observers on page change to ensure we avoid any memory leaks
 * from multiple observers
 *
 * @param id -- The Id of the observer
 */
export const useMutationObserver = (id) => {
    // Get the current observer array
    window.jfObservers = window.jfObservers || [];
    // Get the current observer object
    let observerObject = window.jfObservers.find((obs) => obs.ticketId === id);
    // No current object in global array
    if (!observerObject) {
        // Make one
        observerObject = {
            observer: undefined,
            isObserving: false,
            ticketId: id,
        };
        // Push this instance to the global array
        window.jfObservers.push(observerObject);
    }
    const wrappedObserve = (target, config, callback) => {
        // Check if we are already observing
        if (observerObject.isObserving) {
            return false;
        }
        // Observe if not
        observerObject.observer = new MutationObserver(callback);
        observerObject.observer.observe(target, config);
        observerObject.isObserving = true;
        return true;
    };
    /** Wrapper for the native disconnect function from the Mutation Observer API */
    const wrappedDisconnect = () => {
        var _a;
        (_a = observerObject.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
        observerObject.observer = undefined;
        observerObject.isObserving = false;
        // Remove this instance from the global array
        window.jfObservers = window.jfObservers.filter((obs) => obs.ticketId !== id);
    };
    return {
        details: observerObject,
        observe: wrappedObserve,
        disconnect: wrappedDisconnect,
    };
};
