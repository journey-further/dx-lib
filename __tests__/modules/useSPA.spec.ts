import { insertStyle, useSPA } from "../../src";

// Mock insertStyle
jest.mock("../../src/modules/insertStyle", () => ({
  insertStyle: jest.fn(),
}));

// Mock URL
class MockURL {
  pathname: string;
  constructor(url: string) {
    this.pathname = new URL(url).pathname;
  }
}

// Define mock functions for MutationObserver
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const mockTakeRecords = jest.fn();

class MockMutationObserver {
  observe = mockObserve;
  disconnect = mockDisconnect;
  takeRecords = mockTakeRecords;
}

global.MutationObserver = jest.fn().mockImplementation(() => new MockMutationObserver());

describe("useSPA", () => {
  let testInstance: ReturnType<typeof useSPA>;
  const APPLY = jest.fn();
  const RESET = jest.fn();

  // Add these lines to define mockQuerySelector and mockQuerySelectorAll
  const mockQuerySelector = jest.fn();
  const mockQuerySelectorAll = jest.fn();

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock document.querySelectorAll
    jest.spyOn(document, "querySelectorAll").mockImplementation(() => {
      return {
        forEach: jest.fn(),
      } as any;
    });

    // Reset window.jfTests
    window.jfTests = { tests: [] };

    // Reset location
    delete (window as any).location;
    window.location = new MockURL("http://localhost/") as any;

    // Create test instance
    testInstance = useSPA("test-id");

    // Reset document body
    document.body.innerHTML = "";

    // Reset mock functions
    mockQuerySelector.mockImplementation(() => document.createElement("div"));
    mockQuerySelectorAll.mockImplementation(() => []);
  });

  afterEach(() => {
    // Clean up
    delete window.jfTests;
    jest.resetAllMocks();
    jest.clearAllTimers();
    jest.clearAllMocks();

    // Reset document
    document.body.innerHTML = "";
  });

  describe("initialization and validation", () => {
    it("should initialize with minimum valid options", async () => {
      const options = {
        apply: APPLY,
        pageMatch: "/",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(testInstance.details.isRunning).toBe(true);
      expect(APPLY).toHaveBeenCalled();
    });

    it("should prevent duplicate initialization", async () => {
      const options = {
        apply: APPLY,
        pageMatch: "/",
      };
      const secondOptions = {
        apply: APPLY,
        pageMatch: "/",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      testInstance.init(secondOptions);

      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(APPLY).toHaveBeenCalledTimes(2);
    });

    it("should validate all required options", () => {
      const invalidOptions = [
        {},
        { apply: APPLY },
        { pageMatch: "/" },
        { apply: "not-a-function", pageMatch: "/" },
        { apply: APPLY, pageMatch: 123 },
      ];

      invalidOptions.forEach((options) => {
        expect(() => testInstance.init(options as any)).toThrow();
      });
    });
  });

  describe("page matching functionality", () => {
    it("should apply test when string pageMatch matches current path", async () => {
      window.location.pathname = "/test";
      const options = {
        apply: APPLY,
        pageMatch: "/test",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(APPLY).toHaveBeenCalled();
    });

    it("should apply test when regex pageMatch matches current path", async () => {
      window.location.pathname = "/test/123";
      const options = {
        apply: APPLY,
        pageMatch: /^\/test\/\d+$/,
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(APPLY).toHaveBeenCalled();
    });

    it("should apply test when array pageMatch includes current path", async () => {
      window.location.pathname = "/test";
      const options = {
        apply: APPLY,
        pageMatch: ["/home", "/test", "/about"],
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(APPLY).toHaveBeenCalled();
    });
  });

  describe("style handling", () => {
    beforeEach(() => {
      // Reset insertStyle mock
      (insertStyle as jest.Mock).mockClear();
    });

    it("should insert stylesheet when style option is provided", async () => {
      const options = {
        apply: APPLY,
        pageMatch: "/",
        style: ".test { color: red; }",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(insertStyle).toHaveBeenCalledWith(".test { color: red; }", "test-id--style");
    });

    it("should remove stylesheet on reset", async () => {
      const options = {
        apply: APPLY,
        pageMatch: "/",
        style: ".test { color: red; }",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      testInstance.reset();
      expect(document.querySelectorAll).toHaveBeenCalledWith("#test-id--style");
    });
  });

  describe("cleanup and state management", () => {
    it("should properly clean up on disconnect", async () => {
      const options = {
        apply: APPLY,
        pageMatch: "/",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      testInstance.disconnect();
      expect(testInstance.details.isRunning).toBe(false);
      expect(window.jfTests.tests).not.toContain(testInstance);
    });

    it("should handle reset with cleanup function", async () => {
      const options = {
        apply: APPLY,
        reset: RESET,
        pageMatch: "/",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      testInstance.reset();
      expect(RESET).toHaveBeenCalled();
    });
  });
});
