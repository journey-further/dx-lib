import { getLocaleFromUrl } from "modules";

describe("getLocaleFromUrl", () => {
  const ERROR_ARG_2_WRONG_TYPE = "Arg two should be an array of strings and is optional";
  const ERROR_ARG_2_INDEX_WRONG_TYP = "All indexes of arg 2 should be a string";
  const DOM_NO_LANG = `<html><head></head><body></body></html>`;
  const OVERRIDES = {
    GLOBAL: "global",
    SOMETHING: "some",
  };
  const COUNTRIES = { GB: "en", DE: "de", SE: "se", NL: "nl", IE: "ie", US: "us", IN: "in" };
  type Countries = keyof typeof COUNTRIES | keyof typeof OVERRIDES;
  const COUNTRY_KEYS = Object.keys(COUNTRIES) as Countries[];
  const OVERRIDE_KEYS = Object.keys(OVERRIDES) as Countries[];
  type DomTypes = "html-lang" | "alt-lang" | "no-lang";
  const ERROR_ARG_1_WRONG_TYPE = "Arg one should be a string";
  const URL_NO_ORIGIN = (lang: string) => `/${lang}/something`;
  const URL_ORIGIN = (lang: string) => `https://website.com/${lang}/something`;

  delete window.location;

  const setupTests = (url: string, dom: DomTypes, country: Countries) => {
    // Get the path
    const path = url.replace("https://website.com/", "");

    // Set the location
    window.location = {
      pathname: path,
      origin: "https://website.com/",
      href: `https://website.com/${path}`,
    } as Location;

    if (dom === "alt-lang") {
      // Insert a link tag to the head
      document.head.insertAdjacentHTML(
        "afterbegin",
        `<link rel="alternate" hreflang="${COUNTRIES[country]}-${country.toString()}" href="/${
          COUNTRIES[country]
        }/link"/>`
      );
      return;
    }

    if (dom === "html-lang") {
      // Add a lang attribute to the html element
      document.querySelector("html")?.setAttribute("lang", `${COUNTRIES[country]}-${country.toString()}`);
      return;
    }

    return null;
  };

  it("will throw the correct errors", () => {
    setupTests(URL_NO_ORIGIN("GB"), "html-lang", "GB");
    // @ts-ignore
    expect(() => getLocaleFromUrl({})).toThrowError(ERROR_ARG_1_WRONG_TYPE);
    // @ts-ignore
    expect(() => getLocaleFromUrl("hey", "hey")).toThrowError(ERROR_ARG_2_WRONG_TYPE);
    // @ts-ignore
    expect(() => getLocaleFromUrl("hey", [12232])).toThrowError(ERROR_ARG_2_INDEX_WRONG_TYP);
  });

  it("will identify the correct locality from the overrides array", () => {
    const overridesArray = OVERRIDE_KEYS.map((key) => OVERRIDES[key]);
    overridesArray.forEach((locality) => {
      // Get the country key
      const key = OVERRIDE_KEYS.find((k) => OVERRIDES[k] === locality);
      const noOrigin = URL_NO_ORIGIN(locality);
      const origin = URL_ORIGIN(locality);
      // Setup the test no origin
      setupTests(noOrigin, "alt-lang", key);
      // Check the condition
      expect(getLocaleFromUrl(noOrigin, overridesArray)).toBe(locality);
      // Setup the test with origin
      setupTests(origin, "alt-lang", key);
      // Check the condition
      expect(getLocaleFromUrl(origin, overridesArray)).toBe(locality);
    });
  });

  it("will identify the correct locality from the alternate links", () => {
    const langArray = COUNTRY_KEYS.map((key) => COUNTRIES[key]);
    langArray.forEach((lang) => {
      // Get the country key
      const key = COUNTRY_KEYS.find((k) => COUNTRIES[k] === lang);
      const noOrigin = URL_NO_ORIGIN(lang);
      const origin = URL_ORIGIN(lang);
      setupTests(noOrigin, "alt-lang", key);
      expect(getLocaleFromUrl(noOrigin)).toBe(lang);
      setupTests(origin, "alt-lang", key);
      expect(getLocaleFromUrl(origin)).toBe(lang);
    });
  });

  it("will identify the correct locality from the html lang", () => {
    const langArray = COUNTRY_KEYS.map((key) => COUNTRIES[key]);
    langArray.forEach((lang) => {
      // Get the country key
      const key = COUNTRY_KEYS.find((k) => COUNTRIES[k] === lang);
      const noOrigin = URL_NO_ORIGIN(lang);
      const origin = URL_ORIGIN(lang);
      setupTests(noOrigin, "html-lang", key);
      expect(getLocaleFromUrl(noOrigin)).toBe(lang);
      setupTests(origin, "html-lang", key);
      expect(getLocaleFromUrl(origin)).toBe(lang);
    });
  });

  it("will return null if there are no valid localities in the url", () => {
    const langArray = COUNTRY_KEYS.map((key) => COUNTRIES[key]);
    langArray.forEach((lang) => {
      // Get the country key
      const key = COUNTRY_KEYS.find((k) => COUNTRIES[k] === lang);
      const noOrigin = URL_NO_ORIGIN("ballbags");
      const origin = URL_ORIGIN("ballbags");
      setupTests(noOrigin, "alt-lang", key);
      expect(getLocaleFromUrl(noOrigin)).toBe(null);
      setupTests(origin, "html-lang", key);
      expect(getLocaleFromUrl(origin)).toBe(null);
    });
  });
});
