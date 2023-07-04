import { useEventListener } from "modules";

describe("useEventListener", () => {
  const ARG_1_ERROR = "Arg 1 must be of type string";
  const ARG_2_ERROR = "Arg 2 must be a HTMLElement";
  const ARG_3_ERROR = "Arg 3 must be of type string";
  const ARG_4_ERROR = "Arg 4 must be of type function";
  const ARG_5_ERROR = "Arg 5 must be an object";
  const EVENT_HANDLER = jest.fn();
  const EVENT_HANDLER_2 = jest.fn();
  const HANDLER_ID_1 = "a-handler";
  const HANDLER_ID_2 = "another-handler";
  const ELEMENT_ID_1 = "an-element";
  const ELEMENT_ID_2 = "another-element";
  const GENERATE_ELEMENT = (id) => {
    const div = document.createElement("div");
    div.id = id;
    return div;
  };

  beforeEach(() => {
    // empty the dom
    document.body.innerHTML = "";
    // empty listeners
    window.jfListeners = [];
    // Add an element
    document.body.appendChild(GENERATE_ELEMENT(ELEMENT_ID_1));
    // clear all mock functions
    jest.clearAllMocks();
  });

  it("will throw the correct errors", () => {
    // @ts-ignore
    expect(() => useEventListener()).toThrow(ARG_1_ERROR);
    // @ts-ignore
    expect(() => useEventListener("hey")).toThrow(ARG_2_ERROR);
    // @ts-ignore
    expect(() => useEventListener("hey", document.createElement("div"))).toThrow(ARG_3_ERROR);
    // @ts-ignore
    expect(() => useEventListener("hey", document.createElement("div"), "click")).toThrow(ARG_4_ERROR);
    // @ts-ignore
    expect(() => useEventListener("hey", document.createElement("div"), "click", () => {}, "tits")).toThrow(
      ARG_5_ERROR
    );
  });

  it("will remove an event listener if one with the same ID is in the window array and the element is still in the DOM", () => {
    const element: HTMLElement = document.querySelector(`#${ELEMENT_ID_1}`);
    // call the function
    let listenerObject = useEventListener(HANDLER_ID_1, element, "click", EVENT_HANDLER);
    // Check it worked
    expect(window.jfListeners.length).toBe(1);
    expect(window.jfListeners[0].id).toBe(HANDLER_ID_1);
    // Call it again
    listenerObject = useEventListener(HANDLER_ID_1, element, "click", EVENT_HANDLER);
    // Check there is still only one object in the array
    expect(window.jfListeners.length).toBe(1);
    expect(window.jfListeners[0].id).toBe(HANDLER_ID_1);
    // Check if the callback only gets called once
    element.click();
    expect(EVENT_HANDLER).toBeCalledTimes(1);
  });

  it("will remove the correct listener when the disconnect method is called", () => {
    const element1: HTMLElement = document.querySelector(`#${ELEMENT_ID_1}`);
    const element2: HTMLElement = GENERATE_ELEMENT(ELEMENT_ID_2);
    // add element 2 to the dom
    document.body.append(element2);
    const listenerObject1 = useEventListener(HANDLER_ID_1, element1, "click", EVENT_HANDLER);
    const listenerObject2 = useEventListener(HANDLER_ID_2, element2, "click", EVENT_HANDLER_2);
    // Disconnect 2
    listenerObject2.disconnect();
    // click the element
    element2.click();
    element1.click();
    // run some checks
    expect(window.jfListeners.length).toBe(1);
    expect(window.jfListeners[0].id).toBe(HANDLER_ID_1);
    expect(window.jfListeners[0].element).toBe(element1);
    expect(EVENT_HANDLER_2).toBeCalledTimes(0);
    expect(EVENT_HANDLER).toBeCalledTimes(1);
    // remove the original one
    listenerObject1.disconnect();
    expect(window.jfListeners.length).toBe(0);
    element1.click();
    // shouldn't fire this time
    expect(EVENT_HANDLER).toBeCalledTimes(1);
  });

  it("will return the correct object", () => {
    const element: HTMLElement = document.querySelector(`#${ELEMENT_ID_1}`);
    const listenerObject = useEventListener(HANDLER_ID_1, element, "click", EVENT_HANDLER, { capture: true });
    expect(listenerObject.id).toBe(HANDLER_ID_1);
    expect(listenerObject.element).toBe(element);
    expect(listenerObject.eventName).toBe("click");
    expect(listenerObject.handler).toBe(EVENT_HANDLER);
    expect(typeof listenerObject.disconnect).toBe("function");
    expect(listenerObject.options).toEqual({ capture: true });
  });
});
