export type JfTimerObject = {
  id: string;
  timer: ReturnType<typeof setTimeout>;
  timeout: number;
  handler: () => void;
  disconnect: () => void;
};

declare global {
  interface Window {
    jfTimers: JfTimerObject[];
  }
}

/**
 * Wrapper around the setTimeout function.
 *
 * Use this function to use the window scoped jfTimers array which will allow us to remove timers on page change on
 * SPAs.
 *
 * This is a simple function which will ensure that you never add the same timer twice. It will add an object with the
 * provided ID to the window.jfTimers array and then manage re-addition of the timer if/when this occurs.
 *
 * @param handler A function to execute when timeout expires
 * @param timeout A number to indicate how much time should pass before executing he handler
 * @param id A unique identifier for the timer
 * @returns An object with information about this timer
 */
export const useSetTimeout = (handler: () => void, timeout: number, id: string): JfTimerObject => {
  if (typeof handler !== "function") throw new Error("Arg 1 must be a function");
  if (!timeout || typeof timeout !== "number") throw new Error("Arg 2 must be a number");
  if (!id || typeof id !== "string") throw new Error("Arg 3 must be a string");
  // init an array if one isnt there
  window.jfTimers = window.jfTimers || [];
  // See if we have a timeout with this ID already
  const currentTimeout = window.jfTimers.find((timer) => timer.id === id);
  if (!!currentTimeout) {
    currentTimeout.disconnect();
  }
  // get a new one
  const timer = setTimeout(() => {
    // remove the object from the window array;
    window.jfTimers = window.jfTimers.filter((timers) => timers.id !== id);
    // execute the handler
    handler();
  }, timeout);
  // Disconnect this timer
  const disconnect = () => {
    clearTimeout(timer);
    window.jfTimers = window.jfTimers.filter((timers) => timers.id !== id);
  };
  // make an object
  const timerObj = {
    id,
    timer,
    timeout,
    handler,
    disconnect,
  };
  // push the object to our array so we can clear it
  window.jfTimers.push(timerObj);
  // return it so we can use in a test
  return timerObj;
};
