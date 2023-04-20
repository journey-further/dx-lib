declare global {
    interface Window {
        dataLayer: any[];
    }
}
/**
 * Push an event object into the website's global data layer with the provided info
 *
 * @param event -- The event name
 * @param action -- The ticket ID
 * @param label -- The test ID
 */
export declare const pushToDL: (event: string, action: string, label: string) => void;
//# sourceMappingURL=pushToDL.d.ts.map