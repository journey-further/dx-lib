export const getTimeTo = (timestamp) => {
    const now = new Date().getTime();
    const distance = timestamp - now;
    let days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
    days = days.length < 2 ? "0" + days : days;
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();
    hours = hours.length < 2 ? "0" + hours : hours;
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
    minutes = minutes.length < 2 ? "0" + minutes : minutes;
    let seconds = Math.floor((distance % (1000 * 60)) / 1000).toString();
    seconds = seconds.length < 2 ? "0" + seconds : seconds;
    return {
        days,
        hours,
        minutes,
        seconds,
    };
};
