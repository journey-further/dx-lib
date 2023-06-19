/** A simple function with args */
export type FunctionWithArgs = (...args: unknown[]) => void;
/**
 * Watch an element for user swipe gestures and fire the correct callback depending which direction the user swiped
 *
 * @param element The element we want to watch for swipes on
 * @param leftCallback The callback to execute when the user swipes left
 * @param rightCallback The callback to execute when the user swipes right
 */
export declare const listenForSwipe: (element: Element, leftCallback: FunctionWithArgs, rightCallback: FunctionWithArgs) => void;
//# sourceMappingURL=listenForSwipe.d.ts.map