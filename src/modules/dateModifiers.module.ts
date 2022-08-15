export type ParsedTimeObject = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

/**
 * Return an object with the number of days, hours, minutes and seconds until the provided timestamp is met
 * @param { number } timestamp -- The timestamp you wish to countdown to
 * @returns { ParsedTimeObject } -- An object containing days hours and minutes until provided timestamp
 */
export const getTimeTo = (timestamp: number): ParsedTimeObject => {
  const now: number = new Date().getTime();
  // Throw is the provided timestamp has passed already
  if (now >= timestamp) throw new Error("Provided timestamp has already passed");
  // Get amount of seconds left until timestamp from now
  const distance: number = timestamp - now;
  // Get the number of days left
  let days: string = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
  // prepend a 0 if needed
  days = days.length < 2 ? `0${days}` : days;
  // Get the number of hours
  let hours: string = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();
  // Prepend a 0 if needed
  hours = hours.length < 2 ? `0${hours}` : hours;
  // Get the number of minutes
  let minutes: string = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
  // Prepend a 0 if needed
  minutes = minutes.length < 2 ? `0${minutes}` : minutes;
  // Get the number of seconds
  let seconds: string = Math.floor((distance % (1000 * 60)) / 1000).toString();
  // Prepend 0 if needed
  seconds = seconds.length < 2 ? `0${seconds}` : seconds;
  // Return object with days, hours, minutes, seconds
  return {
    days,
    hours,
    minutes,
    seconds,
  };
};
