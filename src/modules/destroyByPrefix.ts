/**
 * One teardown sweep over every registry the library tracks resources in.
 *
 * Removes every resource owned by `ownerId` under the `<ownerId>--<childId>` compound-id convention — a resource
 * matches when its id equals `ownerId` or starts with `` `${ownerId}--` ``. Swept registries:
 *
 * - `window.jfLib.elementReady/elementRemoved/elementUpdated` callbacks (elementReady's `jfReady` element marks are
 *   cleared too, so a reapply re-fires for surviving elements). When a registry hits zero callbacks its shared
 *   observer is disconnected and the entry removed, so it can be cleanly recreated.
 * - `window.jfLib.customEvents` bus listeners subscribed by the owner
 * - `window.jfLib.listeners` (useEventListener), `window.jfLib.timers` (useSetTimeout), `window.jfLib.observers`
 *   (useMutationObserver)
 *
 * `useSPA` calls this from its reset/destroy paths, which is what makes resources registered inside `apply()` with a
 * `<testId>--` prefixed id auto-tracked. Safe to call at any time; never throws for missing registries.
 *
 * @example
 *   destroyByPrefix("TIK_123456"); // removes TIK_123456 and every TIK_123456--* resource
 *
 * @param {string} ownerId - The owning id — usually a useSPA test id. _(required)_
 */
export const destroyByPrefix = (ownerId: string): void => {
  if (!ownerId || typeof ownerId !== "string") return;
  const matches = (resourceId?: string): boolean =>
    !!resourceId && (resourceId === ownerId || resourceId.startsWith(`${ownerId}--`));

  // element* callback registries
  (["elementReady", "elementRemoved", "elementUpdated"] as const).forEach((key) => {
    const lib = window.jfLib?.[key];
    if (!lib) return;
    Object.keys(lib).forEach((version) => {
      const versionObj = lib[version];
      if (!versionObj?.callbacks) return;

      // clear elementReady's jfReady marks for swept callbacks so a reapply re-decorates surviving elements
      versionObj.callbacks.forEach((cb) => {
        if (!cb || !matches(cb.id) || !("selector" in cb) || !cb.selector) return;
        document.querySelectorAll(cb.selector).forEach((el) => {
          if (!el.jfReady?.includes(cb.id)) return;
          el.jfReady = el.jfReady.filter((markedId) => markedId !== cb.id);
        });
      });

      versionObj.callbacks = (versionObj.callbacks as { id?: string }[]).filter(
        (cb) => !matches(cb?.id)
      ) as typeof versionObj.callbacks;

      // nothing left listening — disconnect the shared observer and drop the entry so it can be recreated
      if (versionObj.callbacks.length === 0) {
        versionObj.observer?.disconnect();
        delete lib[version];
      }
    });
  });

  // customEvents bus listeners
  const customEventsLib = window.jfLib?.customEvents;
  if (customEventsLib) {
    Object.values(customEventsLib).forEach((versionObj) => {
      if (!versionObj?.listeners) return;
      versionObj.listeners = versionObj.listeners.filter((l) => {
        if (!matches(l.ownerId)) return true;
        versionObj.bus.removeEventListener(l.eventType, l.listener);
        return false;
      });
    });
  }

  // versioned listener/timer/observer registries — all three expose disconnect on the tracked object
  Object.values(window.jfLib?.listeners ?? {}).forEach((registry) => {
    registry.filter((l) => matches(l.id)).forEach((l) => l.disconnect());
  });
  Object.values(window.jfLib?.timers ?? {}).forEach((registry) => {
    registry.filter((t) => matches(t.id)).forEach((t) => t.disconnect());
  });
  const observersLib = window.jfLib?.observers;
  if (observersLib) {
    Object.keys(observersLib).forEach((version) => {
      observersLib[version].forEach((o) => {
        if (!matches(o.ticketId)) return;
        o.observer?.disconnect();
        o.observer = undefined;
        o.isObserving = false;
      });
      observersLib[version] = observersLib[version].filter((o) => !matches(o.ticketId));
    });
  }
};
