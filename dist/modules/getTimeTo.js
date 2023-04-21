/**
 * Return an object with the number of days, hours, minutes and seconds until the provided timestamp is met
 *
 * @param timestamp -- The timestamp you wish to countdown to
 * @param shouldPad -- Whether to add a leading 0 to numbers less than 10 (will mean all numbers are a string)
 * @returns An object containing days hours and minutes until provided timestamp
 */
export const getTimeTo = (timestamp, shouldPad = false) => {
    const now = new Date().getTime();
    // Throw is the provided timestamp has passed already
    if (now >= timestamp)
        throw new Error("Provided timestamp has already passed");
    // Get amount of seconds left until timestamp from now
    const distance = timestamp - now;
    // Get the number of days left
    let days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
    // prepend a 0 if needed
    days = days.length < 2 && shouldPad ? `0${days}` : Number(days);
    // Get the number of hours
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();
    // Prepend a 0 if needed
    hours = hours.length < 2 && shouldPad ? `0${hours}` : Number(hours);
    // Get the number of minutes
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
    // Prepend a 0 if needed
    minutes = minutes.length < 2 && shouldPad ? `0${minutes}` : Number(minutes);
    // Get the number of seconds
    let seconds = Math.floor((distance % (1000 * 60)) / 1000).toString();
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
