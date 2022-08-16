var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Doc ready function
export const docReady = (maxAttempts = 10, timeout = 200) => __awaiter(void 0, void 0, void 0, function* () {
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
