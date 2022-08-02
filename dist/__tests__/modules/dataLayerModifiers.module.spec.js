import { pushToDL } from "../../src";
var MISSING_PARAM_ERROR = "All three arguments must be provided";
var EVENT_TYPE_ERROR = "Event must be of type string";
var LABEL_TYPE_ERROR = "Label must be of type string";
var ACTION_TYPE_ERROR = "Action must be of type string";
var ACTION = "action";
var EVENT = "event";
var LABEL = "label";
describe("pushToDL", function () {
    it("will throw if action or label is not provided", function () {
        //@ts-ignore
        expect(function () { return pushToDL("hey", undefined, "hey"); }).toThrowError(MISSING_PARAM_ERROR);
        //@ts-ignore
        expect(function () { return pushToDL("hey", "hey", undefined); }).toThrowError(MISSING_PARAM_ERROR);
    });
    it("will throw a type error if the wrong param type is provided to any arg", function () {
        //@ts-expect-error
        expect(function () { return pushToDL(1, "hey", "hey"); }).toThrowError(EVENT_TYPE_ERROR);
        //@ts-expect-error
        expect(function () { return pushToDL("hey", 1, "hey"); }).toThrowError(ACTION_TYPE_ERROR);
        //@ts-expect-error
        expect(function () { return pushToDL("hey", "hey", 1); }).toThrowError(LABEL_TYPE_ERROR);
    });
    it("will push an object to the global datalayer array", function () {
        pushToDL(EVENT, ACTION, LABEL);
        expect(window.dataLayer).toBeDefined();
        expect(Array.isArray(window.dataLayer)).toBe(true);
        expect(window.dataLayer[0].event).toBe(EVENT);
        expect(window.dataLayer[0].eventAction).toBe(ACTION);
        expect(window.dataLayer[0].eventLabel).toBe(LABEL);
    });
});
