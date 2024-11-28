import { SPA } from "../../src";
import { waitForElement } from "../../src/modules/waitForElement";
import { insertStyle } from "../../src/modules/insertStyle";
import { useMutationObserver } from "../../src/modules/useMutationObserver";

// Mock dependencies
jest.mock("../../src/modules/waitForElement", () => ({
  waitForElement: jest.fn().mockResolvedValue(document.body),
}));

jest.mock("../../src/modules/insertStyle");

jest.mock("../../src/modules/useMutationObserver");

describe("SPA", () => {
  // Mock functions and variables we'll use across tests
  const mockApply = jest.fn();
  const mockReset = jest.fn();
  const mockStyle = ".test-style { color: red; }";
  const TEST_ID = "test-id";
  let mockMutationObserver;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mutation observer mock
    mockMutationObserver = {
      observe: jest.fn(),
      disconnect: jest.fn(),
      details: { isObserving: false },
    };
    (useMutationObserver as jest.Mock).mockReturnValue(mockMutationObserver);

    // Setup insertStyle mock
    (insertStyle as jest.Mock).mockImplementation((style, id) => {
      const styleElement = document.createElement("style");
      styleElement.id = id;
      styleElement.textContent = style;
      document.head.appendChild(styleElement);
      return Promise.resolve();
    });

    // Reset the DOM
    document.body.innerHTML = "";
    document.head.innerHTML = "";

    // Reset the global window.jfSPA
    window.jfSPA = { tests: [], pagePath: "" };

    // Reset waitForElement mock for each test
    (waitForElement as jest.Mock).mockReset().mockResolvedValue(document.body);

    // Mock window.location by default
    delete window.location;
    window.location = { pathname: "/" } as Location;
  });

  describe("Constructor", () => {
    it("throws error when no ID is provided", () => {
      expect(() => new SPA("", { apply: mockApply, pageMatch: "/" })).toThrow();
    });

    it("prevents duplicate test initialization", async () => {
      // Create first instance
      const test1 = new SPA(TEST_ID, { apply: mockApply, pageMatch: "/" });

      // Instead of pushing state directly, initialize the test
      await test1.init();

      // Create second instance with same ID
      const test2 = new SPA(TEST_ID, { apply: mockApply, pageMatch: "/" });

      expect(test2.details.isRunning).toBe(true);
      expect(window.jfSPA.tests.length).toBe(1);
    });

    it("validates required options", () => {
      // @ts-ignore - Testing invalid options
      expect(() => new SPA(TEST_ID, {})).toThrow();
      // @ts-ignore - Testing missing pageMatch
      expect(() => new SPA(TEST_ID, { apply: mockApply })).toThrow();
      // @ts-ignore - Testing missing apply
      expect(() => new SPA(TEST_ID, { pageMatch: "/" })).toThrow();
    });

    describe("Option Validation", () => {
      it("validates apply function", () => {
        // @ts-ignore - Testing invalid apply type
        expect(() => new SPA(TEST_ID, { apply: "not a function", pageMatch: "/" })).toThrow("apply must be a function");
      });

      it("validates pageMatch", () => {
        // Missing pageMatch
        type SPAOptions = {
          apply: () => void;
          reset?: () => void;
          style?: string;
          pageMatch: string | string[] | RegExp;
          watchForRemoval?: string | string[];
          removeOnPageChange?: string | string[];
          removedNode?: string;
        };

        const invalidOptions = {
          apply: mockApply,
        };

        // @ts-ignore - Intentionally missing required prop
        expect(() => new SPA(TEST_ID, invalidOptions)).toThrow("pageMatch must be provided");

        // Invalid pageMatch type
        expect(
          () =>
            new SPA(TEST_ID, {
              apply: mockApply,
              // @ts-ignore - Testing invalid type
              pageMatch: 123,
            })
        ).toThrow("pageMatch must be a string, an array of strings, or a RegExp");
      });

      it("validates reset function if provided", () => {
        expect(
          () =>
            new SPA(TEST_ID, {
              apply: mockApply,
              pageMatch: "/",
              // @ts-ignore - Testing invalid type
              reset: "not a function",
            })
        ).toThrow("reset must be a function");
      });

      it("validates watchForRemoval selectors", () => {
        // Invalid type
        expect(
          () =>
            new SPA(TEST_ID, {
              apply: mockApply,
              pageMatch: "/",
              // @ts-ignore - Testing invalid type
              watchForRemoval: 123,
            })
        ).toThrow("watchForRemoval must be a string or array of strings");

        // Invalid selector
        expect(
          () =>
            new SPA(TEST_ID, {
              apply: mockApply,
              pageMatch: "/",
              watchForRemoval: "invalid[]selector",
            })
        ).toThrow("watchForRemoval must be valid CSS selectors");

        // Invalid selector in array
        expect(
          () =>
            new SPA(TEST_ID, {
              apply: mockApply,
              pageMatch: "/",
              watchForRemoval: ["valid-selector", "invalid[]selector"],
            })
        ).toThrow("watchForRemoval must be valid CSS selectors");
      });

      it("validates removeOnPageChange selectors", () => {
        // Invalid type
        expect(
          () =>
            new SPA(TEST_ID, {
              apply: mockApply,
              pageMatch: "/",
              // @ts-ignore - Testing invalid type
              removeOnPageChange: 123,
            })
        ).toThrow("removeOnPageChange must be a string or array of strings");

        // Invalid selector
        expect(
          () =>
            new SPA(TEST_ID, {
              apply: mockApply,
              pageMatch: "/",
              removeOnPageChange: "invalid[]selector",
            })
        ).toThrow("removeOnPageChange must be valid CSS selectors");

        // Invalid selector in array
        expect(
          () =>
            new SPA(TEST_ID, {
              apply: mockApply,
              pageMatch: "/",
              removeOnPageChange: ["valid-selector", "invalid[]selector"],
            })
        ).toThrow("removeOnPageChange must be valid CSS selectors");
      });

      it("accepts valid options", () => {
        expect(
          () =>
            new SPA(TEST_ID, {
              apply: mockApply,
              pageMatch: "/",
              reset: () => {},
              style: ".test { color: red; }",
              watchForRemoval: ".valid-selector",
              removeOnPageChange: [".valid-selector", "#valid-id"],
            })
        ).not.toThrow();
      });
    });
  });

  describe("Page Matching", () => {
    beforeEach(() => {
      // Mock window.location
      delete window.location;
      window.location = { pathname: "/test" } as Location;
    });

    it("matches exact string paths", async () => {
      const test = new SPA(TEST_ID, {
        apply: mockApply,
        pageMatch: "/test",
      });

      await test.init();
      expect(mockApply).toHaveBeenCalled();
    });

    it("matches regex paths", async () => {
      const test = new SPA(TEST_ID, {
        apply: mockApply,
        pageMatch: /\/test.*/,
      });

      await test.init();
      expect(mockApply).toHaveBeenCalled();
    });

    it("matches array of paths", async () => {
      const test = new SPA(TEST_ID, {
        apply: mockApply,
        pageMatch: ["/test", "/other"],
      });

      await test.init();
      expect(mockApply).toHaveBeenCalled();
    });

    it("calls reset when page doesn't match", async () => {
      window.location.pathname = "/no-match";

      const test = new SPA(TEST_ID, {
        apply: mockApply,
        reset: mockReset,
        pageMatch: "/test",
      });

      await test.init();
      expect(mockApply).not.toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe("Style Handling", () => {
    it("inserts stylesheet when provided", async () => {
      // Mock window.location for page matching
      delete window.location;
      window.location = { pathname: "/" } as Location;

      const test = new SPA(TEST_ID, {
        apply: mockApply,
        pageMatch: "/",
        style: mockStyle,
      });

      // Wait for init and style insertion to complete
      await test.init();
      // Add a small delay to ensure all promises resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Check that the mock was called with correct arguments
      expect(insertStyle).toHaveBeenCalledWith(mockStyle, `${TEST_ID}--style`);

      // Since we're mocking insertStyle, we should check the mock implementation worked
      const styleElement = document.querySelector(`#${TEST_ID}--style`);
      expect(styleElement).toBeTruthy();
      expect(styleElement?.textContent).toBe(mockStyle);
    });

    it("removes stylesheet on reset", async () => {
      // First insert the style
      const test = new SPA(TEST_ID, {
        apply: mockApply,
        pageMatch: "/",
        style: mockStyle,
      });

      await test.init();

      // Create the style element manually to test removal
      const styleElement = document.createElement("style");
      styleElement.id = `${TEST_ID}--style`;
      document.head.appendChild(styleElement);

      // Reset should remove the style
      test.reset();

      expect(document.querySelector(`#${TEST_ID}--style`)).toBeFalsy();
    });
  });

  describe("Element Removal", () => {
    it("removes specified elements on page change", async () => {
      document.body.innerHTML = `
        <div id="test-remove">Remove me</div>
        <div class="test-class">Remove me too</div>
      `;

      const test = new SPA(TEST_ID, {
        apply: mockApply,
        pageMatch: "/",
        removeOnPageChange: ["#test-remove", ".test-class"],
      });

      await test.init();
      window.dispatchEvent(new Event("wt-pagechange"));

      expect(document.querySelector("#test-remove")).toBeFalsy();
      expect(document.querySelector(".test-class")).toBeFalsy();
    });
  });

  describe("Lifecycle Methods", () => {
    it("disconnects test properly", async () => {
      const test = new SPA(TEST_ID, {
        apply: mockApply,
        pageMatch: "/",
      });

      await test.init();
      test.disconnect();

      expect(test.details.isRunning).toBe(false);
      // Instead of checking state directly, check the global tests array
      expect(window.jfSPA.tests.length).toBe(0);
    });

    it("resets test properly", async () => {
      const test = new SPA(TEST_ID, {
        apply: mockApply,
        reset: mockReset,
        pageMatch: "/",
        style: mockStyle,
      });

      await test.init();
      test.reset();

      expect(mockReset).toHaveBeenCalled();
      expect(document.querySelector(`#${TEST_ID}--style`)).toBeFalsy();
    });
  });

  describe("Error Handling", () => {
    it("handles apply function errors", async () => {
      const error = new Error("Apply error");
      const errorApply = jest.fn().mockImplementation(() => {
        throw error;
      });

      const test = new SPA(TEST_ID, {
        apply: errorApply,
        pageMatch: "/",
      });

      // Mock console.warn to prevent error output in tests
      const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});

      await expect(test.init()).rejects.toThrow("Apply error");

      consoleWarn.mockRestore();
    });

    it("handles invalid selectors", () => {
      expect(
        () =>
          new SPA(TEST_ID, {
            apply: mockApply,
            pageMatch: "/",
            watchForRemoval: "invalid[]selector",
          })
      ).toThrow("INVALID_SELECTOR");
    });
  });
});
