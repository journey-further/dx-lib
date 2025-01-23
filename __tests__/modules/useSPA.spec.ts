import { useSPA } from "../../src";
import { JfSPAOptions } from "../../src/modules/useSPA";
import { JfLib } from "../../src/globals";

// Mock Error constructor
const originalError = Error;
global.Error = Object.assign(
  jest.fn((message?: string) => new originalError(message)),
  { captureStackTrace: jest.fn(), stackTraceLimit: 10 }
) as unknown as typeof Error;

describe("useSPA", () => {
  const TEST_ID = "TEST_SPA";
  let defaultOptions: JfSPAOptions;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";

    // Setup window.jfLib with required observers
    window.jfLib = {
      experiments: [],
      pagePath: "/test",
      pageChange: {
        "1.0": {
          observer: {
            details: {
              observer: new MutationObserver(() => {}),
              isObserving: false,
              ticketId: "pageChange-1.0",
            },
            observe: jest.fn().mockReturnValue(true),
            disconnect: jest.fn(),
          },
        },
      },
      reInit: {
        "1.0": {
          observer: {
            details: {
              observer: new MutationObserver(() => {}),
              isObserving: false,
              ticketId: "reInit-1.0",
            },
            observe: jest.fn().mockReturnValue(true),
            disconnect: jest.fn(),
          },
        },
      },
    } as JfLib;

    // Setup default options
    defaultOptions = {
      apply: jest.fn(),
      location: "/test",
    };

    // Mock window location
    delete window.location;
    window.location = {
      pathname: "/test",
      search: "",
      hash: "",
    } as Location;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllTimers();
  });

  it("should initialize with valid options", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    expect(window.jfLib.experiments).toHaveLength(1);
  });

  it("should not initialize with invalid test ID", async () => {
    const spa = useSPA("");
    await expect(spa.init(defaultOptions)).rejects.toThrow();
  });

  it("should match string location pattern", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init({ ...defaultOptions, location: "/test" });
    expect(defaultOptions.apply).toHaveBeenCalled();
  });

  it("should match regex location pattern", async () => {
    const spa = useSPA(TEST_ID);
    await spa.init({ ...defaultOptions, location: /test/ });
    expect(defaultOptions.apply).toHaveBeenCalled();
  });

  it("should not match incorrect location", async () => {
    window.location.pathname = "/no-match";
    const spa = useSPA(TEST_ID);
    await spa.init(defaultOptions);
    expect(defaultOptions.apply).not.toHaveBeenCalled();
  });

  it("should handle screen size conditions", async () => {
    window.innerWidth = 1500;
    const spa = useSPA(TEST_ID);

    await spa.init({
      ...defaultOptions,
      screen: { minWidth: 1000, maxWidth: 2000 },
    });

    expect(defaultOptions.apply).toHaveBeenCalled();
  });

  // it("should reset when screen size conditions not met", async () => {
  //   window.innerWidth = 1500;
  //   const spa = useSPA(TEST_ID);
  //   const reset = jest.fn();

  //   await spa.init({
  //     ...defaultOptions,
  //     screen: { minWidth: 1000, maxWidth: 2000 },
  //     reset,
  //   });

  //   // Trigger resize event and wait for debounce
  //   await new Promise((resolve) => setTimeout(resolve, 250));
  //   window = Object.assign(window, { innerWidth: 500 });
  //   window.dispatchEvent(new Event("resize"));
  //   await new Promise((resolve) => setTimeout(resolve, 250));

  //   expect(reset).toHaveBeenCalled();
  // });

  it("should cleanup on destroy", async () => {
    const spa = useSPA(TEST_ID);

    // Initialize first
    await spa.init(defaultOptions);

    // Add experiment with correct structure
    window.jfLib.experiments = [
      {
        details: { id: TEST_ID, isRunning: true },
        destroy: jest.fn(),
        reset: jest.fn(),
        init: jest.fn(),
      },
    ];

    spa.destroy();
    expect(window.jfLib.experiments).toHaveLength(0);
  });

  it("should execute reset function", async () => {
    const reset = jest.fn();
    const spa = useSPA(TEST_ID);

    await spa.init({
      ...defaultOptions,
      reset,
    });

    spa.reset();
    expect(reset).toHaveBeenCalled();
  });
});
