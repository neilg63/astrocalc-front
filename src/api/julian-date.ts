import { format } from "date-fns";

export const epoch = {
  days: 2440587.5, // ref year in julian displaySnippets
  year: 1970, // ref year
  weekDay: 4, // weekday num of 1 Jan 1970
  secondOffset: (1 / 3600) * 0.3333, // best second offset in hours to account for leap seconds
};

export interface MonthDay {
  month: number;
  day: number;
}

export interface YearItem {
  year: number;
  day: number;
  startDay: number;
  numDays: number;
}

const zPad = (num: number, places = 2): string => {
  const absNum = Math.abs(num);
  const tgRp = places - absNum.toString().length;
  const rp = tgRp > 0 ? (tgRp > places ? places : tgRp) : 0;
  const negPrefix = num < 0 ? "-" : "";
  return rp > 0 ? [negPrefix, "0".repeat(rp), absNum].join("") : num.toString();
};

const zPad2 = (num: number): string => {
  return zPad(num, 2);
};

const zPad4 = (num: number): string => {
  return zPad(num, 4);
};

const matchMonthDay = (dayIndex = 0, numDays = 365): MonthDay => {
  let day = 0;
  let month = 0;
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (numDays === 366) {
    months[1] = 29;
  }
  let days = 0;
  for (let i = 0; i < 12; i++) {
    days += months[i];
    if (days > dayIndex) {
      month = i + 1;
      day = dayIndex - (days - months[i]) + 1;
      break;
    }
  }
  return {
    month,
    day,
  };
};

const daysInYear = (year: number): number => {
  return year % 4 === 0
    ? year % 100 === 0
      ? year % 400 === 0
        ? 366
        : 365
      : 366
    : 365;
};

/*
Convert reference day index with 0 equal to 1970-01-01
to a yearItem object with the year, day index within that year, 
number of days since 1970-01-01 of the first day in the year
and num of days in the year
 */
const daysToYearItem = (refDay: number): YearItem => {
  let matched = false;
  let year = epoch.year;
  let startDay = 0;
  let numDays = 365;
  const negative = refDay < 0;
  let currYear = negative ? epoch.year - 1 : epoch.year;
  let dY = daysInYear(currYear);
  let dayOffset = 0;
  const maxYears = 10000;
  let counter = 0;
  while (!matched) {
    dayOffset = negative ? dayOffset - dY : dayOffset + dY;
    if (Math.abs(dayOffset) > Math.abs(refDay)) {
      matched = true;
      year = currYear;
      numDays = dY;
      startDay = dayOffset;
    }
    currYear = negative ? (currYear -= 1) : (currYear += 1);
    dY = daysInYear(currYear);
    counter++;
    if (counter > maxYears) {
      matched = true;
    }
  }
  const day = negative
    ? Math.floor(refDay - startDay)
    : numDays - Math.ceil(startDay - refDay);
  return { year, day, startDay, numDays };
};

export const julToEpochDays = (jd = 0): number => {
  return jd - epoch.days;
};

export const julToUnixTime = (jd: number, tzOffset = 0): number => {
  return jd !== undefined ? (jd - epoch.days) * 86400 + tzOffset : 0;
};

/**
 convert a julian day decimal to unix-time milliseconds as used
 by the Javascript Date object
*/
export const julToUnixMillisecs = (jd: number, tzOffset = 0): number => {
  return julToUnixTime(jd, tzOffset) * 1000;
};

/*
  Convert the current unixtime to julian days
*/
export const unixTimeToJul = (ts = 0): number => {
  return !isNaN(ts) && ts !== Infinity ? ts / 86400 + epoch.days : 0;
};

/* 
  Return the julian day for the current unix time
  This is timezone-agnostic
*/
export const currentJulianDay = (): number => {
  const ts = new Date().getTime() / 1000;
  return unixTimeToJul(ts);
};

export const localTimeZoneOffset = (): number => {
  return 0 - new Date().getTimezoneOffset() * 60;
};

/* 
  Return the julian day for the current unix time
  This is timezone-agnostic
*/
export const dateStringToJulianDay = (
  dateStr = "",
  autoOffset = false,
  offsetSecs = 0,
  autoAndOverride = true
): number => {
  const dtObj = new Date(dateStr);
  const ts = dtObj.getTime() / 1000;
  // subtract offset applied to Date object by the browser locale settings
  const autoOffsetSecs = autoAndOverride ? dtObj.getTimezoneOffset() * 60 : 0;
  const tsOffset = autoOffset
    ? dtObj.getTimezoneOffset() * 60
    : offsetSecs + autoOffsetSecs;
  return unixTimeToJul(ts - tsOffset);
};

/* 
  Build a Date object independent of system timezone settings
  from a given decimal Julian day. The timezone offset should be 
  expressed in seconds to express time units in a given local time.
  e.g. birth dates of people born in different timezones expressed
  in local time.
  The constructor takes three parameters, all numbers
  jd: decimal julian day
  tzOffset: timezone offset in seconds, e.g 3600 for UTC + 1 or -18000 for UTC - 5
  milliSecondOffset: offset in milliseconds for the rounding of the calculated second value
    This should not be more than 500, but this accounts for irregularities in the synchronisation between 
    astromical years and days. The Official ISO8061 datetime object has leap seconds every 2-3 years. 
    The julian day will always align with days, but may be out of sync with ISO seconds by as much as 1 second between leap second adjustments.
    This tends to average out, but when converting between ISO and julian dates, the value shift by a second.
    The default value in epoch const above is 3333 milliseconds and this works best for most times in the last century.
    const jDate = new JulDate(2450587.538363563, 7200);
    jDate.toISOString(); // 1997-05-19T02:55:14.000Z
    jDate.toISOSimple(); // 1997-05-19T02:55:14
    jDate.toString() // 1997-05-19 02:55:14
    jDate.dmy // 19/05/1997
    jDate.mdy // 05/19/1997
    jDate.isoDate // 1997-05-19
    jDate.euroDate // 19.05.1997
    jDate.hms // 02:55:14
    jDate.hm // 02:55
    jDate.year // 1997
    jDate.unixTime // 864003314.6118343
    jDate.unixMillisecs // 864003314611.8343
*/
export class JulDate {
  year = 0;
  month = 0;
  day = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  daysInYear = 0;
  yearDayIndex = 0;
  tzOffset = 0;
  refDay = 0;
  jd = 0;
  private secondOffset = -1;
  [key: string]: any; // generic dynamic attribute

  constructor(jd = 0, tzOffset = 0) {
    if (jd > 0) {
      this.buildFromJd(jd, tzOffset);
    }
  }

  buildFromJd(jd: number, tzOffset: number, milliSecondOffset = -1000) {
    const adjustedJd = jd + tzOffset / 86400;
    const refDay = adjustedJd - epoch.days;
    this.jd = jd;
    this.refDay = refDay;
    this.tzOffset = tzOffset;
    if (milliSecondOffset > -1000 && milliSecondOffset < 1000) {
      this.secondOffset = milliSecondOffset * 1000;
    }
    const yearItem = daysToYearItem(refDay);
    this.daysInYear = yearItem.numDays;
    this.year = yearItem.year;
    this.yearDayIndex = yearItem.day;
    const monthItem = matchMonthDay(yearItem.day, yearItem.numDays);
    this.month = monthItem.month;
    this.day = monthItem.day;
    const secOffset =
      this.secondOffset > -1 && this.secondOffset < 1
        ? this.secondOffset
        : epoch.secondOffset;
    const flHours = (Math.abs(adjustedJd - 0.5) % 1) * 24 + secOffset;
    this.hours = Math.floor(flHours);
    const flMins = (flHours % 1) * 60;
    this.minutes = Math.floor(flMins);
    const flSecs = (flMins % 1) * 60;
    this.seconds = Math.floor(flSecs);
  }

  get unixTime(): number {
    return julToUnixTime(this.jd);
  }

  get unixMillisecs(): number {
    return this.unixTime * 1000;
  }

  get refDayNum() {
    return Math.floor(this.refDay);
  }

  get decimalTime() {
    return this.refDay % 1;
  }

  get weekDay() {
    return ((this.refDayNum + epoch.weekDay - 1) % 7) + 1;
  }

  offsetDisplay(padded = false, alwaysShowMinutes = false) {
    const mins = Math.abs(this.tzOffset) / 60;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const posNeg = this.tzOffset < 0 ? "-" : "+";
    const strHrs = padded ? zPad2(hours) : hours.toString();
    const parts = ["UTC ", posNeg, strHrs];
    if (alwaysShowMinutes || minutes > 0) {
      parts.push(":" + zPad2(minutes));
    }
    return parts.join("");
  }

  get offsetHrs() {
    return this.offsetDisplay();
  }

  get offsetHm() {
    return this.offsetDisplay(true, true);
  }

  toString(): string {
    return this.format("iso");
  }

  toISOString(): string {
    return this.format("isoT") + ".000Z";
  }

  toISOSimple(): string {
    return this.format("isoT");
  }

  /* NB: 
  this ignores the timezone offset so javascript
  can correctly apply from the timezone-neutral

  */
  toDate() {
    return new Date(this.unixMillisecs);
  }

  /*
   * dmy/euro/euro1 => DD/MM/YYYY e.g. 30/06/2014 (default)
   * eu/euroDot/de/euro2 => DD.MM.YYYY e.g. 30.06.2014
   * euroHyphen/in/euro3 => DD-MM-YYYY e.g. 30-06-2014
   * us/mdy => MM/DD/YYYY e.g. 06/30/2014
   * iso => 2014-06-30, (with time) 2013-06-30 11:59:59
   * isoT (with time) 2013-06-30T11:59:59.00Z
   * examples
   */
  format(
    fmt = "euro1",
    timeOptions = {
      time: true,
      seconds: true,
    }
  ): string {
    const [y, m, d] = [zPad4(this.year), zPad2(this.month), zPad2(this.day)];
    let dp = [d, m, y];
    let sep = "/";
    let useGetter = false;
    const midSep = fmt === "isoT" ? "T" : " ";
    switch (fmt) {
      case "us":
      case "usa":
      case "mdy":
        dp = [m, d, y];
        break;
      case "dm":
        dp = [d, m];
        break;
      case "euro2":
      case "de":
      case "eu":
      case "euroDot":
        sep = ".";
        break;
      case "euro3":
      case "in":
      case "euroHyphen":
        sep = "-";
        break;
      case "iso":
      case "ymd":
      case "isoT":
        dp = [y, m, d];
        sep = "-";
        break;
      case "extended":
        dp = [];
        useGetter = true;
        break;
      case "-":
      case "":
        dp = [];
        break;
    }
    const parts = dp.length > 1 ? [dp.join(sep)] : useGetter ? [this[fmt]] : [];
    if (timeOptions.time) {
      const timeParts = [zPad2(this.hours), zPad2(this.minutes)];
      if (timeOptions.seconds) {
        timeParts.push(zPad2(this.seconds));
      }
      parts.push(timeParts.join(":"));
    }
    return parts.join(midSep);
  }

  get isoDate() {
    return this.format("iso", { time: false, seconds: false });
  }

  get ymdDate() {
    return this.format("ymd", { time: false, seconds: false });
  }

  get dmyDate() {
    return this.format("dmy", { time: false, seconds: false });
  }

  get dmDate() {
    return [zPad2(this.month), this.year].join("/");
  }

  get monthName() {
    switch (this.month) {
      case 1:
        return "January";
      case 2:
        return "February";
      case 3:
        return "March";
      case 4:
        return "April";
      case 5:
        return "May";
      case 6:
        return "June";
      case 7:
        return "July";
      case 8:
        return "August";
      case 9:
        return "September";
      case 10:
        return "October";
      case 11:
        return "November";
      case 12:
        return "December";
      default:
        return "";
    }
  }

  get shortMonthName() {
    return this.monthName.substring(0, 3);
  }

  get weekDayName() {
    switch (this.weekDay) {
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      case 7:
        return "Sunday";
      default:
        return "";
    }
  }

  get shortWeekDayName() {
    return this.weekDayName.substring(0, 3);
  }

  get extended() {
    return [
      this.shortWeekDayName,
      [this.day, this.shortMonthName, this.year].join(" "),
    ].join(", ");
  }

  get euDate() {
    return this.format("euroDot", { time: false, seconds: false });
  }

  get mdyDate() {
    return this.format("mdy", { time: false, seconds: false });
  }

  timeString(seconds = true): string {
    return this.format("-", { time: true, seconds });
  }

  get yearDay() {
    return this.yearDayIndex + 1;
  }

  get hms() {
    return this.timeString(true);
  }

  get hm() {
    return this.timeString(false);
  }

  get dmyHm() {
    return this.format("dmy", { time: true, seconds: false });
  }

  get dmyHms() {
    return this.format("dmy", { time: true, seconds: true });
  }
}

export const julToDateParts = (jd = 0, offsetSecs = 0): JulDate => {
  return new JulDate(jd, offsetSecs);
};

export const currentJulianDate = (utc = false) => {
  const jd = currentJulianDay();
  const offset = !utc ? 0 - new Date().getTimezoneOffset() * 60 : 0;
  return new JulDate(jd, offset);
};

export const dateStringToJulianDate = (dateStr = "", offset = 0) => {
  const jd = dateStringToJulianDay(dateStr, true);
  return new JulDate(jd, offset);
};

export const localDateStringToJulianDate = (dateStr = "", offset = 0) => {
  const jd = dateStringToJulianDay(dateStr, false, offset);
  return new JulDate(jd, offset);
};

export const julianDayOffsetToNoon = (jd = 0, offset = 0) => {
  return Math.round(jd) - offset / 86400;
};

export const calcLongitudeOffset = (lng = 0) => 1 / (360 / lng);

export const julianDayGeoOffsetToStart = (
  jd = 0,
  lng = 0,
  noon = false
): number => {
  const offset = calcLongitudeOffset(lng);
  const startOffset = noon ? 0 : -0.5;
  return Math.round(jd - startOffset) - offset + startOffset;
};

export const julianDayGeoOffsetToNoon = (jd = 0, lng = 0): number => {
  return julianDayGeoOffsetToStart(jd, lng, true);
};

export const currentTzOffset = (): number => {
  return new Date().getTimezoneOffset() * 60;
};
