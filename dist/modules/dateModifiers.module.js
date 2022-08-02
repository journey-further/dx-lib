/**
 * Return an object with the number of days, hours, minutes and seconds until the provided timestamp is met
 * @param { number } timestamp -- The timestamp you wish to countdown to
 * @returns { ParsedTimeObject } -- An object containing days hours and minutes until provided timestamp
 */
export var getTimeTo = function (timestamp) {
    var now = new Date().getTime();
    // Throw is the provided timestamp has passed already
    if (now >= timestamp)
        throw new Error("Provided timestamp has already passed");
    // Get amount of seconds left until timestamp from now
    var distance = timestamp - now;
    // Get the number of days left
    var days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
    // prepend a 0 if needed
    days = days.length < 2 ? "0" + days : days;
    // Get the number of hours
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();
    // Prepend a 0 if needed
    hours = hours.length < 2 ? "0" + hours : hours;
    // Get the number of minutes
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
    // Prepend a 0 if needed
    minutes = minutes.length < 2 ? "0" + minutes : minutes;
    // Get the number of seconds
    var seconds = Math.floor((distance % (1000 * 60)) / 1000).toString();
    // Prepend 0 if needed
    seconds = seconds.length < 2 ? "0" + seconds : seconds;
    // Return object with days, hours, minutes, seconds
    return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
    };
};
