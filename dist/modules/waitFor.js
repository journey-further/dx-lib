/**
 * Either wait for the provided callback to return a truthy value (and then return it) or for max tries to be met, in
 * which case just bail and return false.
 *
 * @param callback The callback to execute
 * @param _maxTries The maximum number of attempts
 * @param _timeout The initial timeout
 * @returns The truthy/falsy value
 */
export const waitFor = async (callback, _maxTries = 20, _timeout = 100) => {
    // init our variables
    let tries = 0;
    let timeout = _timeout;
    // Start our loop
    while (tries < _maxTries) {
        // Try get the output
        const output = callback();
        // Check it is not falsey
        if (!output) {
            // It is so increment variables
            tries += 1;
            timeout += _timeout;
            // And wait for timeout
            // eslint-disable-next-line
            await new Promise((resolve) => setTimeout(resolve, timeout));
        }
        else {
            // Otherwise return the output
            return output;
        }
    }
    return null;
};
