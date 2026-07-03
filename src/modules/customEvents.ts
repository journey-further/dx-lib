const VERSION = "1.0";

type Detail = { [key: string]: unknown };

/** A tracked bus subscription, so teardown sweeps can remove an experiment's listeners */
export type JfBusListener = {
  ownerId: string;
  eventType: string;
  listener: EventListener;
};

const initBus = () => {
  window.jfLib = window.jfLib || {};
  window.jfLib.customEvents = window.jfLib.customEvents || {};
  if (!window.jfLib.customEvents[VERSION]) {
    window.jfLib.customEvents[VERSION] = { bus: new EventTarget(), listeners: [] };
  }
};

const getEntry = () => {
  initBus();
  return window.jfLib.customEvents[VERSION];
};

const getBus = (): EventTarget => getEntry().bus;

/**
 * Per-experiment event bus, scoped to the provided experiment ID.
 *
 * Events are namespaced internally as `${id}:${type}` so experiments cannot accidentally cross-contaminate each other.
 * Cross-experiment listening is supported via the optional `fromId` argument on `on`.
 *
 * The underlying `EventTarget` is shared on `window.jfLib.customEvents["1.0"].bus` so it persists across module
 * boundaries without import cycles. Every subscription is tracked in `window.jfLib.customEvents["1.0"].listeners`
 * under the subscribing experiment's id, so `destroyByPrefix`/useSPA resets can sweep them.
 *
 * @example
 *   const { emit, on } = customEvents("TIK_123456");
 *
 *   const unsubscribe = on("hotel:selected", (detail) => {
 *     console.log(detail.hotelId);
 *   });
 *
 *   emit("hotel:selected", { hotelId: "latimer-estate" });
 *
 *   unsubscribe(); // remove listener
 *
 * @param {string} id - The experiment ID (e.g. "TIK_123456"). Used to namespace all emitted events.
 * @returns {{ emit; on }} Event bus scoped to this experiment.
 */
export const customEvents = (id: string) => {
  initBus();

  /**
   * Emit an event on this experiment's bus.
   *
   * @param {string} type - Event name.
   * @param {Detail} detail - Optional payload object.
   */
  const emit = (type: string, detail: Detail = {}): void => {
    getBus().dispatchEvent(new CustomEvent(`${id}:${type}`, { detail }));
  };

  /**
   * Subscribe to an event on this experiment's bus, or another experiment's bus via `fromId`.
   *
   * @param {string} type - Event name.
   * @param {Function} handler - Callback receiving the event detail.
   * @param {string} [fromId] - Source experiment ID when listening cross-experiment.
   * @returns {Function} Unsubscribe function.
   */
  const on = (type: string, handler: (detail: Detail) => void, fromId?: string): (() => void) => {
    const namespace = fromId ?? id;
    const eventType = `${namespace}:${type}`;
    const listener = (e: Event): void => {
      handler((e as CustomEvent<Detail>).detail);
    };
    getBus().addEventListener(eventType, listener);
    getEntry().listeners.push({ ownerId: id, eventType, listener });

    const off = (): void => {
      getBus().removeEventListener(eventType, listener);
      const entry = getEntry();
      entry.listeners = entry.listeners.filter((l) => l.listener !== listener);
    };
    return off;
  };

  return { emit, on };
};
