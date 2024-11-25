/**
 * Represents a structured object containing time measurements in days, hours, minutes, and seconds.
 *
 * Each property can be a number or a string, allowing flexibility for scenarios where time values may need to be
 * zero-padded or formatted as strings.
 *
 * @property {string | number} days - The number of days.
 * @property {string | number} hours - The number of hours.
 * @property {string | number} minutes - The number of minutes.
 * @property {string | number} seconds - The number of seconds.
 */
export type ParsedTimeObject = {
  days: string | number;
  hours: string | number;
  minutes: string | number;
  seconds: string | number;
};

/**
 * Calculates the time remaining until a given timestamp and returns it as an object with days, hours, minutes, and
 * seconds.
 *
 * This function takes a future timestamp and calculates the difference between the current time and the provided time.
 * If the `shouldPad` parameter is `true`, all numbers less than 10 are padded with a leading zero and returned as
 * strings, otherwise they will be returned as numbers.
 *
 * @param {number} timestamp - The future timestamp to count down to, in milliseconds.
 * @param {boolean} [shouldPad=false] - Whether to pad numbers less than 10 with a leading zero. Default is `false`
 * @returns {ParsedTimeObject} An object containing the remaining `days`, `hours`, `minutes`, and `seconds`.
 */

export const getTimeTo = (timestamp: number, shouldPad = false): ParsedTimeObject => {
  const now: number = new Date().getTime();
  // Throw is the provided timestamp has passed already
  if (now >= timestamp) throw new Error("Provided timestamp has already passed");
  // Get amount of seconds left until timestamp from now
  const distance: number = timestamp - now;
  // Get the number of days left
  let days: string | number = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
  // prepend a 0 if needed
  days = days.length < 2 && shouldPad ? `0${days}` : Number(days);
  // Get the number of hours
  let hours: string | number = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();
  // Prepend a 0 if needed
  hours = hours.length < 2 && shouldPad ? `0${hours}` : Number(hours);
  // Get the number of minutes
  let minutes: string | number = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
  // Prepend a 0 if needed
  minutes = minutes.length < 2 && shouldPad ? `0${minutes}` : Number(minutes);
  // Get the number of seconds
  let seconds: string | number = Math.floor((distance % (1000 * 60)) / 1000).toString();
  // Prepend 0 if needed
  seconds = seconds.length < 2 && shouldPad ? `0${seconds}` : Number(seconds);
  // Return object with days, hours, minutes, seconds
  return {
    days,
    hours,
    minutes,
    seconds,
  };
};
