/** Object for listeners added with useEventListener */
export type JfListenerObject = {
  /** The ID of the listener */
  id: string;
  /** The callback to execute when the listener is triggered */
  handler: EventListener;
  /** The element to listen for events on */
  element: HTMLElement;
  /** Additional event listener options */
  options: AddEventListenerOptions;
  /** The name of the event to listen for */
  eventName: string;
  /** A method to disconnect this listener */
  disconnect: () => void;
};

declare global {
  interface Window {
    jfListeners: JfListenerObject[];
  }
}

/**
 * Wrapper around the addEventListener function which utilises a window scoped array of all listeners.
 *
 * Mostly useful on SPA websites where the possibility of event listeners being incorrectly applied after page changes
 * is much greater but can be useful to limit double adds of event listeners on static sites also.
 *
 * @param id The ID of this listener
 * @param element The element to listen for events on
 * @param eventName The name of the event to listen for
 * @param handler The handler to fire when the event is triggered
 * @param options The options to pass to the event listener
 * @returns An object with information about the listener and a method to remove it
 */
export const useEventListener = (
  id: string,
  element: HTMLElement,
  eventName: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): JfListenerObject => {
  if (typeof id !== "string") throw new Error("Arg 1 must be of type string");
  if (!(element instanceof HTMLElement)) throw new Error("Arg 2 must be a HTMLElement");
  if (typeof eventName !== "string") throw new Error("Arg 3 must be of type string");
  if (typeof handler !== "function") throw new Error("Arg 4 must be of type function");
  if (typeof options !== "object" && options) throw new Error("Arg 5 must be an object or undefined");
  // define the array in case there isnt one
  window.jfListeners = window.jfListeners || [];
  // define callback to remove this listener
  const disconnect = () => {
    element.removeEventListener(eventName, handler, options);
    window.jfListeners = window.jfListeners.filter((l) => l.id !== id);
  };

  // See if a listener with this ID has been added already
  const currentListener = window.jfListeners.find((listener) => listener.id === id);
  // remove the current listener if the element is still in the DOM
  if (currentListener && document.documentElement.contains(currentListener.element)) {
    currentListener.disconnect?.();
  }

  //cleanup the array
  if (currentListener) {
    window.jfListeners = window.jfListeners.filter((listener) => listener.id !== id);
  }
  // Add the listener
  element?.addEventListener(eventName, handler, options);
  // object to return and push to window
  const listenerObject = { element, eventName, id, handler, options, disconnect };
  // Push the object
  window.jfListeners.push(listenerObject);
  // Return method to remove it
  return listenerObject;
};
