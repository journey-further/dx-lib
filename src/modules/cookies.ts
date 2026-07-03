/**
 * Read, write, and delete cookies with a symmetric `get`/`set`/`del` API (matching `storage`).
 *
 * Values are `encodeURIComponent`-encoded on write and decoded on read, so they round-trip safely through
 * `document.cookie`'s `;`/`=` delimiters.
 *
 * @example
 *   cookies.set("selectedSiteName", "Leeds & York", { days: 30, path: "/" });
 *   const site = cookies.get("selectedSiteName"); // "Leeds & York"
 *   cookies.del("selectedSiteName", { path: "/" });
 */
export const cookies = {
  /**
   * Read a cookie by name.
   *
   * @param {string} name - Cookie name.
   * @returns {string | null} The decoded value, or `null` when the cookie doesn't exist.
   */
  get: (name: string): string | null => {
    for (const pair of document.cookie.split(";")) {
      const [key, ...rest] = pair.split("=");
      if (key.trim() === name) return decodeURIComponent(rest.join("="));
    }
    return null;
  },

  /**
   * Write a cookie. Session cookie unless `days` is provided.
   *
   * @param {string} name - Cookie name.
   * @param {string} value - Cookie value (URI-encoded automatically).
   * @param {object} [opts] - Cookie attributes.
   * @param {number} [opts.days] - Lifetime in days. Omit for a session cookie.
   * @param {string} [opts.path="/"] - Cookie path. Default is `"/"`
   * @param {string} [opts.domain] - Cookie domain (e.g. `".example.com"` for cross-subdomain).
   * @returns {void}
   */
  set: (name: string, value: string, opts?: { days?: number; path?: string; domain?: string }): void => {
    let cookie = `${name}=${encodeURIComponent(value)}; path=${opts?.path ?? "/"}`;
    if (opts?.days !== undefined) {
      cookie += `; expires=${new Date(Date.now() + opts.days * 864e5).toUTCString()}`;
    }
    if (opts?.domain) cookie += `; domain=${opts.domain}`;
    document.cookie = cookie;
  },

  /**
   * Delete a cookie by writing it with an expiry in the past. `path`/`domain` must match the values used on `set`.
   *
   * @param {string} name - Cookie name.
   * @param {object} [opts] - Cookie attributes.
   * @param {string} [opts.path="/"] - Cookie path. Default is `"/"`
   * @param {string} [opts.domain] - Cookie domain.
   * @returns {void}
   */
  del: (name: string, opts?: { path?: string; domain?: string }): void => {
    cookies.set(name, "", { ...opts, days: -1 });
  },
};
