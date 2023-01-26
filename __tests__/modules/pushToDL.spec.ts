import { pushToDL } from "../../src";

const MISSING_PARAM_ERROR = "All three arguments must be provided";
const EVENT_TYPE_ERROR = "Event must be of type string";
const LABEL_TYPE_ERROR = "Label must be of type string";
const ACTION_TYPE_ERROR = "Action must be of type string";
const ACTION = "action";
const EVENT = "event";
const LABEL = "label";

describe("pushToDL", () => {
  it("will throw if action or label is not provided", () => {
    //@ts-ignore
    expect(() => pushToDL("hey", undefined, "hey")).toThrowError(
      MISSING_PARAM_ERROR
    );
    //@ts-ignore
    expect(() => pushToDL("hey", "hey", undefined)).toThrowError(
      MISSING_PARAM_ERROR
    );
  });

  it("will throw a type error if the wrong param type is provided to any arg", () => {
    //@ts-expect-error
    expect(() => pushToDL(1, "hey", "hey")).toThrowError(EVENT_TYPE_ERROR);
    //@ts-expect-error
    expect(() => pushToDL("hey", 1, "hey")).toThrowError(ACTION_TYPE_ERROR);
    //@ts-expect-error
    expect(() => pushToDL("hey", "hey", 1)).toThrowError(LABEL_TYPE_ERROR);
  });

  it("will push an object to the global datalayer array", () => {
    pushToDL(EVENT, ACTION, LABEL);
    expect(window.dataLayer).toBeDefined();
    expect(Array.isArray(window.dataLayer)).toBe(true);
    expect(window.dataLayer[0].event).toBe(EVENT);
    expect(window.dataLayer[0].eventAction).toBe(ACTION);
    expect(window.dataLayer[0].eventLabel).toBe(LABEL);
  });
});
