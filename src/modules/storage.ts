const makeStore = (backing: () => Storage) => ({
  /**
   * Read and JSON-parse a value from storage.
   *
   * @param {string} key - Storage key.
   * @param {T} fallback - Returned when the key is missing, the value isn't valid JSON, or storage is unavailable.
   * @returns {T} The parsed value, or `fallback` on any failure.
   */
  get: <T>(key: string, fallback: T): T => {
    try {
      const raw = backing().getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  /**
   * JSON-stringify and write a value to storage. No-ops on any failure (quota, privacy mode, unserialisable value).
   *
   * @param {string} key - Storage key.
   * @param {T} value - Value to store.
   * @returns {void}
   */
  set: <T>(key: string, value: T): void => {
    try {
      backing().setItem(key, JSON.stringify(value));
    } catch {
      // ignore — storage unavailable or full
    }
  },

  /**
   * Remove a key from storage. No-ops on any failure.
   *
   * @param {string} key - Storage key.
   * @returns {void}
   */
  del: (key: string): void => {
    try {
      backing().removeItem(key);
    } catch {
      // ignore — storage unavailable
    }
  },
});

/**
 * Non-throwing JSON wrappers around `localStorage` and `sessionStorage`.
 *
 * Every method is guarded: `get` returns the provided fallback when the key is missing, holds junk, or storage access
 * itself throws (some privacy modes throw on reading `window.localStorage`); `set`/`del` silently no-op on failure.
 * The backing storage is resolved lazily inside each call so the access happens within the guard.
 *
 * @example
 *   storage.session.set("TIK_123456_viewedProducts", ["sku-1", "sku-2"]);
 *   const viewed = storage.session.get<string[]>("TIK_123456_viewedProducts", []);
 *   storage.local.del("TIK_123456_dismissed");
 */
export const storage = {
  local: makeStore(() => window.localStorage),
  session: makeStore(() => window.sessionStorage),
};
