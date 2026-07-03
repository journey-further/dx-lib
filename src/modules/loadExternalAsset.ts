/**
 * Dynamically load an external script or stylesheet into `<head>`, with dedup checks so the same asset is never
 * injected twice.
 *
 * Before injecting, the DOM is checked for an existing `<script src>` / `<link href>` matching the URL, and the
 * optional `checkExisting` predicate is consulted (e.g. `() => !!window.Swiper`). If either says the asset is already
 * present, the promise resolves `true` without injecting.
 *
 * Never rejects: resolves `true` when the asset loads (or was already present), `false` if it fails to load.
 *
 * @param {string} url - The asset URL.
 * @param {"script" | "style"} type - Whether to inject a `<script>` or a `<link rel="stylesheet">`.
 * @param {object} [options] - Configuration options.
 * @param {Function} [options.checkExisting] - Extra dedup predicate; return `true` if the asset is already available.
 * @returns {Promise<boolean>} Resolves `true` on load or already-present, `false` on load error.
 *
 * @example
 *   const loaded = await loadExternalAsset("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js", "script", {
 *     checkExisting: () => !!window.Swiper,
 *   });
 *   if (!loaded) return; // CDN failed — bail out of the test
 */
export const loadExternalAsset = (
  url: string,
  type: "script" | "style",
  options?: { checkExisting?: () => boolean }
): Promise<boolean> => {
  return new Promise((resolve) => {
    const selector = type === "script" ? `script[src="${url}"]` : `link[href="${url}"]`;
    if (options?.checkExisting?.() || document.querySelector(selector)) {
      resolve(true);
      return;
    }

    let elem: HTMLScriptElement | HTMLLinkElement;
    if (type === "script") {
      elem = document.createElement("script");
      elem.src = url;
    } else {
      elem = document.createElement("link");
      elem.rel = "stylesheet";
      elem.href = url;
    }
    elem.onload = () => resolve(true);
    elem.onerror = () => resolve(false);
    document.head.appendChild(elem);
  });
};
