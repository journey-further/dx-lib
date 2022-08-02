// Doc ready function
export const docReady = async (maxAttempts: number = 10, timeout: number = 200): Promise<boolean> => {
  let attempts = 0;
  if ((document.readyState as DocumentReadyState) === "complete") return true;
  while ((document.readyState as DocumentReadyState) !== "complete") {
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
