/**
 * Extracts the localisation segment from a given URL using in-page attributes and specific checks.
 *
 * This function determines the locale by checking the following in order:
 *
 * 1. If the first segment of the URL path matches any value in the `userOverrides` array (if provided).
 * 2. If the HTML `lang` attribute contains the first segment of the URL path.
 * 3. If there is an `<link rel="alternate">` element pointing to a URL with the same first segment.
 *
 * If no matches are found, the function returns `null`.
 *
 * @param {string} [url=window.location.pathname] - The URL to check. Defaults to the current pathname. Default is
 *   `window.location.pathname`
 * @param {string[]} [userOverrides] - An optional array of custom localities (e.g., "global") to include in the checks.
 * @returns {string | null} The matching locale string if found, or `null` if no match is identified.
 */

export const getLocaleFromUrl = (url = window.location.pathname, userOverrides?: string[]): null | string => {
  // Catch some possible errors
  if (userOverrides && !Array.isArray(userOverrides))
    throw new Error("Arg two should be an array of strings and is optional");

  if (userOverrides && userOverrides.find((item) => typeof item !== "string"))
    throw new Error("All indexes of arg 2 should be a string");

  if (typeof url !== "string") throw new Error("Arg one should be a string");

  // Remove the parts of the url we wont use
  const urlToUse = url.replace(window.location.origin, "");

  // What is the first section of this url
  const urlPrefix = urlToUse.split("/").filter((index) => index !== "")?.[0];

  // return null if there is no prefix, we are on the default language
  if (!urlPrefix) return null;
  // The user specified overrides contains the urlPrefix so it must be correct
  if (userOverrides?.includes(urlPrefix)) return urlPrefix;

  // Is there a lang attribute on the HTML element?
  const htmlLang = document.querySelector("html")?.getAttribute("lang");

  // We have a HTML lang attribute so the prefix is a valid locality
  if (htmlLang?.split(/-|_/)?.includes(urlPrefix)) {
    return urlPrefix;
  }

  // Are there rel="alternate" elements?
  const matchingAlternateUrl = Array.from(
    document.querySelectorAll<HTMLLinkElement>('head link[rel="alternate"]')
  ).find((altUrl) => new RegExp(`/${urlPrefix}(/?|$)`).test(altUrl?.href));

  // We have a matching alternate URL so the prefix is a valid locality
  if (matchingAlternateUrl) {
    return urlPrefix;
  }

  // Couldn't find a match so return null
  return null;
};
