import { elementInView } from "modules";

describe("elementInView", () => {
  const ELEMENT_ID = "to-check";
  const DOM_STYLE = `<style>body{min-height: 1400px;}</style>`;
  const DOM_ELEMENT = `${DOM_STYLE}<div id="${ELEMENT_ID}" style="height: 20vh">Yo</div>`;
  const ERROR_MISSING_ELEMENT = "Parameter one is required";
  const ERROR_ARG_1_NOT_ELEMENT = "Parameter one must be an instance of HTMLElement";
  const ERROR_ARG_2_NOT_BOOLEAN = "Parameter 2 must be a boolean";

  // The the height of the window -- This is the same for all tests
  global.window.innerHeight = 800;

  // Allow us to set the values returned regarding the element's position and size within the DOM
  const setupTest = (element: HTMLDivElement, height: number, top: number, bottom: number) => {
    return jest.spyOn(element, "getBoundingClientRect").mockReturnValue({ height, top, bottom } as any);
  };

  // Tidy up after each test
  afterEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  it("will throw the correct errors", () => {
    expect(() => elementInView(undefined, undefined)).toThrow(ERROR_MISSING_ELEMENT);
    // @ts-ignore
    expect(() => elementInView("Hello", undefined)).toThrow(ERROR_ARG_1_NOT_ELEMENT);
    // @ts-ignore
    expect(() => elementInView(document.createElement("div"), "hey")).toThrow(ERROR_ARG_2_NOT_BOOLEAN);
  });

  it("will return true when the element is fully in view", () => {
    document.body.insertAdjacentHTML("afterbegin", DOM_ELEMENT);
    const element = document.querySelector<HTMLDivElement>(`#${ELEMENT_ID}`);
    setupTest(element, 400, 200, 600);
    const isInView = elementInView(element);
    expect(isInView).toBe(true);
  });

  it("will return true when the element is partially in view when the second parameter is omitted or is true", () => {
    document.body.insertAdjacentHTML("afterbegin", DOM_ELEMENT);
    const element = document.querySelector<HTMLDivElement>(`#${ELEMENT_ID}`);
    // Top partially visible
    setupTest(element, 400, 600, 1000);
    let isInView = elementInView(element, true);
    expect(isInView).toBe(true);

    // Default second param
    isInView = elementInView(element);
    expect(isInView).toBe(true);

    // Bottom partially visible
    setupTest(element, 400, -200, 200);
    isInView = elementInView(element, true);
    expect(isInView).toBe(true);

    // Default second param
    isInView = elementInView(element);
    expect(isInView).toBe(true);

    // Middle partially visible
    setupTest(element, 1200, -100, 1100);
    isInView = elementInView(element, true);
    expect(isInView).toBe(true);

    // Default second param
    isInView = elementInView(element);
    expect(isInView).toBe(true);
  });

  it("will return false when the element is partially in view and the second parameter is false", () => {
    document.body.insertAdjacentHTML("afterbegin", DOM_ELEMENT);
    const element = document.querySelector<HTMLDivElement>(`#${ELEMENT_ID}`);
    // Top partially visible
    setupTest(element, 400, 600, 1000);
    let isInView = elementInView(element, false);
    expect(isInView).toBe(false);

    // Bottom partially visible
    setupTest(element, 400, -200, 200);
    isInView = elementInView(element, false);
    expect(isInView).toBe(false);

    // Middle partially visible
    setupTest(element, 1200, -100, 1100);
    isInView = elementInView(element, false);
    expect(isInView).toBe(false);
  });

  it("will return false when the element is not in view at all", () => {
    document.body.insertAdjacentHTML("afterbegin", DOM_ELEMENT);
    const element = document.querySelector<HTMLDivElement>(`#${ELEMENT_ID}`);

    // Scrolled past already
    setupTest(element, 400, -600, -200);
    let isInView = elementInView(element, false);
    expect(isInView).toBe(false);

    // Not yet reached by viewpoint
    setupTest(element, 400, 1000, 1400);
    isInView = elementInView(element, false);
    expect(isInView).toBe(false);
  });
});
