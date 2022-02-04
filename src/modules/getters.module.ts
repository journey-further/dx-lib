export const waitFor = async (
  callback: () => unknown,
  _tries: number = 0,
  _timeout: number = 100
): Promise<unknown> => {
  // init our variables
  let tries = _tries,
    timeout = _timeout;
  // Start our loop
  while (tries < 20) {
    // Try get the output
    const output = callback();
    // Check it is not falsey
    if (!output) {
      // It is so increment variables
      tries += 1;
      timeout += 100;
      // And wait for timeout
      await new Promise((resolve) => setTimeout(resolve, timeout));
    } else {
      // Otherwise return the output
      return output;
    }
  }
  return null;
};
