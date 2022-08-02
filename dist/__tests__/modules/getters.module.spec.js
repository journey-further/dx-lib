var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { waitFor, queryAll, getElementByXPath, findParents } from "../../src";
("use strict");
var MOCK_QUERY = ".mock";
// We need to mock our timers
jest.useRealTimers();
jest.spyOn(global, "setTimeout");
jest.setTimeout(100000);
describe("waitFor", function () {
    // Cleanup after each test
    afterEach(function () {
        while (document.body.firstChild) {
            document.body.firstChild.remove();
        }
        jest.clearAllTimers();
        jest.clearAllMocks();
    });
    it("will return the truthy value", function () { return __awaiter(void 0, void 0, void 0, function () {
        var callback, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callback = jest.fn().mockReturnValue(document.createElement("div"));
                    return [4 /*yield*/, waitFor(callback)];
                case 1:
                    result = _a.sent();
                    expect(result).toBeDefined();
                    expect(result instanceof HTMLElement).toBe(true);
                    expect(setTimeout).toBeCalledTimes(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it("will call callback 20 times by default", function () { return __awaiter(void 0, void 0, void 0, function () {
        var callback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callback = jest.fn().mockReturnValue(undefined);
                    return [4 /*yield*/, waitFor(callback, undefined, 1)];
                case 1:
                    _a.sent(); // set poll to 1s as we dont care about that
                    expect(setTimeout).toHaveBeenCalledTimes(20);
                    expect(callback).toHaveBeenCalledTimes(20);
                    return [2 /*return*/];
            }
        });
    }); });
    it("will call callback X times by when passed", function () { return __awaiter(void 0, void 0, void 0, function () {
        var callback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callback = jest.fn().mockReturnValue(undefined);
                    return [4 /*yield*/, waitFor(callback, 50, 1)];
                case 1:
                    _a.sent(); // set poll to 1s as we dont care about that
                    expect(setTimeout).toHaveBeenCalledTimes(50);
                    expect(callback).toHaveBeenCalledTimes(50);
                    return [2 /*return*/];
            }
        });
    }); });
    it("will call timeout with the correct default poll values", function () { return __awaiter(void 0, void 0, void 0, function () {
        var callback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callback = jest.fn().mockReturnValue(undefined);
                    return [4 /*yield*/, waitFor(callback)];
                case 1:
                    _a.sent(); // set poll to 1s as we dont care about that
                    expect(setTimeout).toHaveBeenCalledTimes(20);
                    expect(setTimeout.mock.calls[0][1]).toBe(200); // First recursion should be 100 + 100
                    expect(setTimeout.mock.calls[19][1]).toBe(2100); // Last recursion should be 2100
                    return [2 /*return*/];
            }
        });
    }); });
    it("will call timeout with the correct provided poll values", function () { return __awaiter(void 0, void 0, void 0, function () {
        var callback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callback = jest.fn().mockReturnValue(undefined);
                    return [4 /*yield*/, waitFor(callback, undefined, 1)];
                case 1:
                    _a.sent(); // set poll to 1s as we dont care about that
                    expect(setTimeout).toHaveBeenCalledTimes(20);
                    expect(setTimeout.mock.calls[0][1]).toBe(2); // First recursion should be 1 + 1
                    expect(setTimeout.mock.calls[19][1]).toBe(21); // Last recursion should be 20 + 1
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("queryAll", function () {
    it("will return a true array", function () {
        var result = queryAll(MOCK_QUERY);
        expect(Array.isArray(result)).toBe(true);
        expect(result.reduce).toBeDefined();
    });
    it("will call querySelectorAll with the provided argument", function () {
        var spy = jest.spyOn(document, "querySelectorAll");
        queryAll(MOCK_QUERY);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(MOCK_QUERY);
    });
});
describe("Get Element By XPath", function () {
    beforeAll(function () {
        jest.clearAllMocks();
    });
    it("Will return a html element", function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            document.body.insertAdjacentHTML("afterbegin", "<h2>Hello</h2>");
            result = getElementByXPath("//h2[contains(string(), 'Hello')]");
            expect(result).toBeDefined();
            expect(result instanceof HTMLElement).toBe(true);
            expect(result.textContent).toBe("Hello");
            return [2 /*return*/];
        });
    }); });
    it("Will return undefined", function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            document.body.insertAdjacentHTML("afterbegin", "<h2>Hello</h2>");
            result = getElementByXPath("//h3[contains(string(), 'Hello')]");
            expect(result).toBeUndefined();
            return [2 /*return*/];
        });
    }); });
});
describe("Find parents by ClassName", function () {
    beforeAll(function () {
        jest.clearAllMocks();
    });
    it("Will return a html element", function () { return __awaiter(void 0, void 0, void 0, function () {
        var div, h2, result;
        return __generator(this, function (_a) {
            div = document.createElement("div");
            h2 = document.createElement("h2");
            div.classList.add("container");
            div.insertAdjacentElement("beforeend", h2);
            h2.textContent = "Hello";
            result = findParents(h2, "container");
            expect(result).toBeDefined();
            expect(result instanceof HTMLElement).toBe(true);
            expect(result === null || result === void 0 ? void 0 : result.textContent).toBe("Hello");
            return [2 /*return*/];
        });
    }); });
    it("Will return null", function () { return __awaiter(void 0, void 0, void 0, function () {
        var h2, result;
        return __generator(this, function (_a) {
            h2 = document.createElement("h2");
            h2.textContent = "Hello";
            result = findParents(h2, "container");
            expect(result).toBeNull();
            return [2 /*return*/];
        });
    }); });
    it("Will return null with wrong attribute", function () { return __awaiter(void 0, void 0, void 0, function () {
        var div, h2, result;
        return __generator(this, function (_a) {
            div = document.createElement("div");
            h2 = document.createElement("h2");
            div.setAttribute("class", "container");
            div.insertAdjacentElement("beforeend", h2);
            h2.textContent = "Hello";
            result = findParents(h2, "container", "id");
            expect(result).toBeNull();
            return [2 /*return*/];
        });
    }); });
});
