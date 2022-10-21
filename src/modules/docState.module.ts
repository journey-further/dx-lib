// Doc ready function
export const docReady = async (maxAttempts = 10, timeout = 200): Promise<boolean> => {
  let attempts = 0;
  if (document.readyState === "complete") return true;
  while (!/^complete$/gi.test(document.readyState)) {
    if (attempts >= maxAttempts) return false;
    attempts += 1;
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(null);
      }, timeout)
    );
  }
  return true;
};
