import { getTimeTo } from "modules";
import { ParsedTimeObject } from "types/generic";

const PASSED_TIMESTAMP_ERROR = "Provided timestamp has already passed";

const TIMESTAMP_FUTURE = 1893456000764; // Tue Jan 01 2030 00:00:00 GMT+0000 (Greenwich Mean Time)
const TIMESTAMP_TODAY_1 = 1892550630764; // Tue Dec 21 2029 12:30:30 GMT+0000 (Greenwich Mean Time)
const TIMESTAMP_TODAY_2 = 1892933877764; // Tue Dec 25 2029 22:57:57 GMT+0000 (Greenwich Mean Time)

const EXPECTED_RESULT_1: ParsedTimeObject = {
  days: "10",
  hours: "11",
  minutes: "29",
  seconds: "30",
};

const EXPECTED_RESULT_2: ParsedTimeObject = {
  days: "06",
  hours: "01",
  minutes: "02",
  seconds: "03",
};
describe("getTimeTo", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("will throw if the timestamp provided has already passed", () => {
    expect(() => getTimeTo(new Date().getTime() - 2000)).toThrowError(PASSED_TIMESTAMP_ERROR);
  });

  it("will return an object with the correct number for days, time, minutes and seconds", () => {
    // 10 days, 11 hours, 29 minutes, 30 seconds
    jest.useFakeTimers().setSystemTime(TIMESTAMP_TODAY_1);
    const result = getTimeTo(TIMESTAMP_FUTURE);
    expect(result.days).toBe(EXPECTED_RESULT_1.days);
    expect(result.hours).toBe(EXPECTED_RESULT_1.hours);
    expect(result.minutes).toBe(EXPECTED_RESULT_1.minutes);
    expect(result.seconds).toBe(EXPECTED_RESULT_1.seconds);
  });

  it("will prepend numbers lower than 10 with a 0", () => {
    // 06 days, 01 hours, 02 minutes, 03 seconds
    jest.useFakeTimers().setSystemTime(TIMESTAMP_TODAY_2);
    const result = getTimeTo(TIMESTAMP_FUTURE);
    expect(result.days).toBe(EXPECTED_RESULT_2.days);
    expect(result.hours).toBe(EXPECTED_RESULT_2.hours);
    expect(result.minutes).toBe(EXPECTED_RESULT_2.minutes);
    expect(result.seconds).toBe(EXPECTED_RESULT_2.seconds);
  });
});
