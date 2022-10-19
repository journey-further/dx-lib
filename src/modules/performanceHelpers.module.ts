import { FunctionWithArgs } from "types/generic";

export function debounce(callback: FunctionWithArgs, delay = 200) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}
