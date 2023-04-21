/**
 * Take a URL and extract the localisation URL path by using a number of in page attributes. The function will check the
 * following in the specified order:
 *
 * 1. The array of provided includes the first section of the url path provided
 * 2. The HTML language attribute includes the first section of the url path
 * 3. There is an alternate link to this page with the first section of the url path
 *
 * @param url The url to check, defaults to pathname
 * @param userOverrides An array of accepted un-standardised localities, for example 'global'
 * @returns The locality which has matched a check or null
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
