import { __awaiter } from '../_virtual/_tslib.js';

// Doc ready function
const docReady = (maxAttempts = 10, timeout = 200) => __awaiter(void 0, void 0, void 0, function* () {
    let attempts = 0;
    if (document.readyState === "complete")
        return true;
    while (document.readyState !== "complete") {
        if (attempts >= maxAttempts)
            return false;
        attempts += 1;
        yield new Promise((resolve) => setTimeout(() => {
            resolve(null);
        }, timeout));
    }
    return true;
});

export { docReady };
