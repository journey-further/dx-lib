var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { parseJsonToFormData } from "../../src";
var WRONG_ARGUMENT_TYPE_ERROR_MESSAGE = "Parameter 1 must be of type object";
var JSON_DATA = {
    arg: "hey",
    arg1: 12,
    arg3: "wut",
};
describe("parseToFormData", function () {
    afterEach(function () {
        jest.resetModules();
    });
    it("will throw if the argument is not a json", function () {
        // @ts-expect-error
        expect(function () { return parseJsonToFormData("Hey"); }).toThrowError(WRONG_ARGUMENT_TYPE_ERROR_MESSAGE);
    });
    it("will not throw if the argument is a json", function () {
        expect(function () { return parseJsonToFormData({ yo: "hey" }); }).not.toThrow();
    });
    it("will return a form data object with the correct keys and values converted to strings", function () {
        var e_1, _a;
        var result = parseJsonToFormData(JSON_DATA);
        var values = __spreadArray([], __read(result.values()), false);
        var keys = __spreadArray([], __read(result.keys()), false);
        try {
            for (var _b = __values(Object.keys(JSON_DATA)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                expect(keys.includes(key)).toBe(true);
                expect(values.includes("".concat(JSON_DATA[key]))).toBe(true);
                expect(typeof values[values.indexOf("".concat(JSON_DATA[key]))]).toBe("string");
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        expect(result instanceof FormData).toBe(true);
    });
});
