export const waitFor = async (
  callback: () => unknown,
  _tries: number = 0,
  _timeout: number = 100
): Promise<unknown> => {
  // init our variables
  let tries = 0,
    timeout = _timeout;
  // Start our loop
  while (tries < _tries) {
    // Try get the output
    const output = callback();
    // Check it is not falsey
    if (!output) {
      // It is so increment variables
      tries += 1;
      timeout += _timeout;
      // And wait for timeout
      await new Promise((resolve) => setTimeout(resolve, timeout));
    } else {
      // Otherwise return the output
      return output;
    }
  }
  return null;
};
