// Tiny event-bus to decouple modules (prevents sidebar<->map import cycles)
// Usage:
//   emit('hotel:selected', { hotelId: 'latimer-estate' })
//   on('hotel:selected', (detail) => { ... })

const BUS = new EventTarget();

export const emit = (type: string, detail: unknown = {}): void => {
  BUS.dispatchEvent(new CustomEvent(type, { detail }));
};

export const on = (type: string, handler: (detail: unknown) => void): (() => void) => {
  const listener = (e: Event): void => {
    const customEvent = e as CustomEvent;
    handler(customEvent.detail);
  };

  BUS.addEventListener(type, listener);

  // Return unsubscribe for convenience (not required)
  return () => BUS.removeEventListener(type, listener);
};
