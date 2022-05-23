// Doc ready function
export const docReady = async (
  maxAttempts: number = 10,
  timeout: number = 200
): Promise<boolean> => {
  let _attempts = 0;
  if ((document.readyState as DocumentReadyState) === "complete") return true;
  else
    while ((document.readyState as DocumentReadyState) !== "complete") {
      if (_attempts >= maxAttempts) return false;
      _attempts++;
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(null);
        }, timeout)
      );
    }
  return true;
};
