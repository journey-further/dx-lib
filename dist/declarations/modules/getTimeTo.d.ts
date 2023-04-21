/** An object with key/value pairs relating to time measurements */
export type ParsedTimeObject = {
    days: string | number;
    hours: string | number;
    minutes: string | number;
    seconds: string | number;
};
/**
 * Return an object with the number of days, hours, minutes and seconds until the provided timestamp is met
 *
 * @param timestamp -- The timestamp you wish to countdown to
 * @param shouldPad -- Whether to add a leading 0 to numbers less than 10 (will mean all numbers are a string)
 * @returns An object containing days hours and minutes until provided timestamp
 */
export declare const getTimeTo: (timestamp: number, shouldPad?: boolean) => ParsedTimeObject;
//# sourceMappingURL=getTimeTo.d.ts.map