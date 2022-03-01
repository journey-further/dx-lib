export const getTimeTo = (timestamp) => {
    const now = new Date().getTime();
    // Get amount of seconds left until timestamp from now
    const distance = timestamp - now;
    // Get the number of days left
    let days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
    // prepend a 0 if needed
    days = days.length < 2 ? "0" + days : days;
    // Get the number of hours
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();
    // Prepend a 0 if needed
    hours = hours.length < 2 ? "0" + hours : hours;
    // Get the number of minutes
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
    // Prepend a 0 if needed
    minutes = minutes.length < 2 ? "0" + minutes : minutes;
    // Get the number of seconds
    let seconds = Math.floor((distance % (1000 * 60)) / 1000).toString();
    // Prepend 0 if needed
    seconds = seconds.length < 2 ? "0" + seconds : seconds;
    // Return object with days, hours, minutes, seconds
    return {
        days,
        hours,
        minutes,
        seconds,
    };
};
