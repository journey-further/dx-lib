/** An object with information relating to a mutation observer applied by useMutationObserver */
export interface JfObserverObject {
    observer: MutationObserver | undefined;
    isObserving: boolean;
    ticketId: string;
}
/** Wrapper for the observe function in the mutation observer api */
export type JfObserveFunction = (target: Node, config: MutationObserverInit, callback: MutationCallback) => boolean;
/** The object returned by the useMutationObserver function */
export interface JfObserver {
    details: JfObserverObject;
    disconnect: () => void;
    observe: JfObserveFunction;
}
declare global {
    interface Window {
        jfObservers: JfObserverObject[];
    }
}
/**
 * Scoped mutation observer which will prevent itself from re-adding and will utilise a globally scoped jfObservers
 * array on the window object.
 *
 * Using this will allow the WTO tag to remove all active observers on page change to ensure we avoid any memory leaks
 * from multiple observers
 *
 * @param id -- The Id of the observer
 */
export declare const useMutationObserver: (id: string) => JfObserver;
//# sourceMappingURL=useMutationObserver.d.ts.map