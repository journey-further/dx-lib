var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const waitFor = (callback, _tries = 0, _timeout = 100) => __awaiter(void 0, void 0, void 0, function* () {
    let tries = _tries, timeout = _timeout;
    while (tries < 20) {
        const output = callback();
        if (!output) {
            tries += 1;
            timeout += 100;
            yield new Promise((resolve) => setTimeout(resolve, timeout));
        }
        else {
            return output;
        }
    }
    return null;
});
