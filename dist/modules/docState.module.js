import { __awaiter, __generator } from '../_virtual/_tslib.js';

// Doc ready function
var docReady = function (maxAttempts, timeout) {
    if (maxAttempts === void 0) { maxAttempts = 10; }
    if (timeout === void 0) { timeout = 200; }
    return __awaiter(void 0, void 0, void 0, function () {
        var attempts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attempts = 0;
                    if (document.readyState === "complete")
                        return [2 /*return*/, true];
                    _a.label = 1;
                case 1:
                    if (!(document.readyState !== "complete")) return [3 /*break*/, 3];
                    if (attempts >= maxAttempts)
                        return [2 /*return*/, false];
                    attempts += 1;
                    return [4 /*yield*/, new Promise(function (resolve) {
                            return setTimeout(function () {
                                resolve(null);
                            }, timeout);
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, true];
            }
        });
    });
};

export { docReady };
