import { useSPA } from "../../src";

// Mock DOM APIs
// const mockQuerySelector = jest.fn();
// const mockQuerySelectorAll = jest.fn(() => []);
// const mockAddEventListener = jest.fn();
// const mockRemoveEventListener = jest.fn();

// document.querySelector = mockQuerySelector;
// document.querySelectorAll = mockQuerySelectorAll;
// window.addEventListener = mockAddEventListener;
// window.removeEventListener = mockRemoveEventListener;

describe("useSPA", () => {
  let testInstance: ReturnType<typeof useSPA>;
  const APPLY = jest.fn();
  const RESET = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.jfTests = { tests: [] };
    testInstance = useSPA("test-id");
  });

  afterEach(() => {
    delete window.jfTests;
    jest.resetAllMocks();
    jest.clearAllTimers();
    jest.clearAllMocks();
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
      const secondApply = jest.fn();
      const secondOptions = {
        apply: secondApply,
        pageMatch: "/",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      testInstance.init(secondOptions);

      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(secondApply).not.toHaveBeenCalled();
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
    beforeEach(() => {
      // Reset location for each test
      delete window.location;
      window.location = new URL("http://localhost/") as any;
    });

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
    it("should insert stylesheet when style option is provided", async () => {
      const mockInsertStyle = jest.fn();
      jest.mock("../../src/modules/insertStyle", () => ({
        insertStyle: mockInsertStyle,
      }));

      const options = {
        apply: APPLY,
        pageMatch: "/",
        style: ".test { color: red; }",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(mockInsertStyle).toHaveBeenCalledWith(".test { color: red; }", "test-id--style");
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

    it("should maintain loop count for watchForRemoval", async () => {
      const options = {
        apply: APPLY,
        pageMatch: "/",
        watchForRemoval: ".test-element",
      };

      testInstance.init(options);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Simulate multiple removals
      for (let i = 0; i < 6; i++) {
        const event = new MutationRecord();
        event.removedNodes = [{ nodeType: 1, classList: { contains: () => true } }];
        document.querySelector("body").dispatchEvent(new CustomEvent("mutation", { detail: event }));
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(APPLY).toHaveBeenCalledTimes(5); // Should stop at 5 attempts
    });
  });
});
