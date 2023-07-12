import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import getISODay from "date-fns/getISODay";
import subDays from "date-fns/subDays";
import fromUnixTime from "date-fns/fromUnixTime";
import intervalToDuration from "date-fns/intervalToDuration";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";
import { formatToTimeZone } from "date-fns-timezone";
import addSeconds from "date-fns/addSeconds";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import {
  validDateTimeString,
  isNumeric,
  notEmptyString,
  zeroPad2,
} from "./utils";
import {
  dateStringToJulianDate,
  julToDateParts,
  julToUnixTime,
} from "./julian-date";
import { getGeoTzOffset } from "./geoloc-utils";

export interface DegreesMinutesSeconds {
  deg: number;
  min: number;
  sec?: number;
}

export const zeroPad = (inval: number | string, places = 2) => {
  let num = 0;
  if (typeof inval === "string") {
    num = parseInt(inval);
  } else if (typeof inval === "number") {
    num = inval;
  }
  const strs: Array<string> = [];
  const len = num > 0 ? Math.floor(Math.log10(num)) + 1 : 1;
  if (num < Math.pow(10, places - 1)) {
    const ep = places - len;
    strs.push("0".repeat(ep));
  }
  strs.push(num.toString());
  return strs.join("");
};

export const sortNumPad = (inval: string): string => {
  return isNumeric(inval) ? zeroPad(inval, 10) : inval;
};

export const smartSortNumPad = (inval: string): string => {
  const [c, k] = inval.split("__");
  return [c, sortNumPad(k)].join("__");
};

export const secondsToHMS = (seconds: any) => {
  const parts = [];
  if (isNumeric(seconds)) {
    if (seconds >= 3600) {
      parts.push(Math.floor(seconds / 3600) + "h");
    }
    if (seconds >= 60) {
      parts.push((Math.floor(seconds / 60) % 60) + "m");
    }
    const secs = seconds % 60;
    if (secs) {
      parts.push(secs + "s");
    }
  }
  return parts.join(" ");
};

export const capitalize = (str: string) => {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

export const chomp = (str: string, max = 128) => {
  const wl = str.length;
  return wl > max ? str.substring(0, max) + "." : str;
};

export const truncate = (str: string, max = 128) => {
  const parts = str.split(" ");
  let end = 0;
  const numWords = parts.length;
  if (numWords > 1) {
    const wordList = parts.map((word, index) => {
      const extra = index > 0 ? 1 : 0;
      end += word.length + extra;
      return {
        word,
        end,
      };
    });
    const lastIndex = wordList.findIndex((part) => part.end > max);
    return lastIndex > 0
      ? parts.slice(0, lastIndex).join(" ")
      : chomp(parts.join(" "), max);
  } else {
    return chomp(str, max);
  }
};

export const truncateFirstInit = (str: string, max = 32) => {
  const wl = str.length;
  if (wl > max) {
    const words = str.split(" ");
    const lastIndex = words.length - 1;
    return words
      .map((w, i) => (i < lastIndex ? w.substring(0, 1) + "." : w))
      .join(" ");
  } else {
    return str;
  }
};

export const dmsToDegrees = (dms: DegreesMinutesSeconds) => {
  let v = 0;
  const keys = Object.keys(dms);
  if (keys.includes("deg")) {
    v = dms.deg;
  }
  if (keys.includes("min")) {
    v += dms.min / 60;
  }
  if (keys.includes("sec")) {
    const { sec } = dms;
    if (typeof sec === "number") {
      v += sec / 3600;
    }
  }
  return v;
};

/*
@param flDeg:number
@return Object
*/
export const decDegToDms = (flDeg: any): DegreesMinutesSeconds => {
  const dms = { deg: 0, min: 0, sec: 0 };
  if (isNumeric(flDeg)) {
    flDeg = parseFloat(flDeg);
    dms.deg = Math.floor(flDeg);
    if (dms.deg < 0) {
      dms.deg += 1;
    }
    const remainder = Math.abs(flDeg % 1);
    const flMins = remainder * 60;
    dms.min = Math.floor(flMins);
    const remainderMins = Math.abs(flMins % 1);
    dms.sec = remainderMins * 60;
    if (dms.sec >= 60) {
      dms.min += 1;
      dms.sec %= 60;
    }
  }
  return dms;
};

export const dmsStringToDec = (strDeg: string): number => {
  let num = 0;
  const vals = strDeg.trim().split(/[º'" ]+/);
  const dirRgx = /^[NSEW]$/i;
  const dirVals = vals.filter((p) => dirRgx.test(p));
  const dir = dirVals.length > 0 ? dirVals.shift() : "";
  const numVals = vals.filter(isNumeric).map(parseFloat);

  if (numVals.length > 0) {
    num = Math.floor(numVals[0]);
    num += Math.floor(numVals[1]) / 60;
    if (vals.length > 2) {
      num += numVals[2] / 3600;
    }
  } else if (numVals.length > 0) {
    num = numVals[0];
  }
  switch (dir) {
    case "S":
    case "W":
      num = 0 - Math.abs(num);
      break;
  }
  switch (dir) {
    case "N":
      if (num > 90) {
        num = 90;
      }
      break;
    case "S":
      if (num < -90) {
        num = -90;
      }
      break;
    case "E":
      if (num > 180) {
        num = 180;
      }
      break;
    case "W":
      if (num < -180) {
        num = -180;
      }
      break;
  }
  return num;
};

export const dmsStringToNumParts = (
  value = "",
  mode = "lat"
): { deg: number; mins: number; secs: number; dir: string } => {
  const compassOptions = mode === "lat" ? `(N|S)` : `(E|W)`;
  const dirRgx = new RegExp("^[^a-z]*?" + compassOptions + ".*?$", "i");
  const endPart = value.replace(dirRgx, "$1");
  const dir = notEmptyString(endPart) ? endPart : "";
  const parts = value.split(/[^0-9\.]+/);
  const numParts = parts.length;
  let deg = 0;
  let mins = 0;
  let secs = 0;
  if (numParts > 0) {
    deg = smartCastInt(parts[0]);
    mins = numParts > 1 ? smartCastInt(parts[1]) : 0;
    secs = numParts > 2 ? smartCastInt(parts[2]) : 0;
  }
  return { deg, mins, secs, dir };
};

export const dmsUnitsToString = (deg = 0, mins = 0, secs = 0, dir = "") => {
  const minStr = zeroPad2(mins);
  const secStr = zeroPad2(secs);
  const newValue = `${deg}º ${minStr}' ${secStr}" ${dir}`;
  return newValue.trim();
};

export const offsetDate = (datetime: Date, offset = 0) =>
  addSeconds(datetime, offset);

export const addDegreeLetter = (flDeg: number, mode = "raw"): string => {
  const isNeg = flDeg < 0;
  let letter = "";
  switch (mode) {
    case "lat":
    case "mlat":
      letter = isNeg ? "S" : "N";

      break;
    case "lng":
    case "lon":
    case "mlng":
    case "mlon":
      letter = isNeg ? "W" : "E";
      break;
  }
  return letter;
};

/*
@param flDeg:number
@param mode:string (raw|lat|lng)
@return string
*/
export const degAsDms = (
  flDeg: any,
  mode = "raw",
  precision = 3,
  zeroPadDegrees = false,
  fullMode = true
): string => {
  const dms = decDegToDms(flDeg % 360);
  const letter = addDegreeLetter(flDeg, mode);
  const letterInMiddle = ["mlat", "mlng"].includes(mode);
  const hasLetter = letter.length > 0 && flDeg !== 0;
  const degrees = Math.abs(dms.deg);
  const showPlus = ["prefix"].includes(mode);
  const showPrefix = (flDeg < 0 && !hasLetter) || showPlus;
  const plusMinus = showPrefix ? (flDeg < 0 ? "-" : "+") : "";
  const suffix = hasLetter && !letterInMiddle ? " " + letter : "";
  const midLetter = hasLetter && letterInMiddle ? letter + " " : "";
  let strSecs = "";
  if (precision >= 0) {
    let sec3dec = dms.sec?.toFixed(precision);
    if (precision > 0) {
      sec3dec = sec3dec?.replace(/0+$/, "").replace(/\.$/, "");
    }
    const secDisplay = parseFloat(sec3dec as string);
    if (secDisplay >= 60 && secDisplay < 60.1) {
      dms.min += 1;
      sec3dec = "0";
    }
    strSecs = ` ${zeroPad(sec3dec as string, 2)}"`;
  }
  const degVal = zeroPadDegrees ? zeroPad(degrees) : degrees.toString();
  const showMins = mode !== "deg" || dms.min > 0;
  const strMins = showMins ? zeroPad(dms.min, 2) + "'" : "";
  const firstPart = `${plusMinus}${degVal}º`;
  let secondPart = "";
  if (fullMode || dms.min > 0 || (dms.sec !== undefined && dms.sec > 0)) {
    secondPart = `${midLetter}${strMins}${strSecs}`;
  }
  return `${firstPart} ${secondPart}${suffix}`;
};

export const degAsDmsFlexi = (
  flDeg: any,
  mode = "raw",
  precision = 3,
  zeroPadDegrees = false
): string => {
  return degAsDms(flDeg, mode, precision, zeroPadDegrees, false);
};

export const degAsLatStr = (deg: number): string => {
  return degAsDms(deg, "lat");
};

export const degAsLngStr = (deg: number): string => {
  return degAsDms(deg, "lng");
};

export const degAsDm = (flDeg: any, mode = "raw", zeroPaDegrees = false) => {
  return degAsDms(flDeg, mode, -1, zeroPaDegrees);
};

export const decPlaces = (flDeg: any, places = 3): string => {
  let str = "";
  if (isNumeric(flDeg)) {
    flDeg = parseFloat(flDeg);
    str = flDeg
      .toFixed(places)
      .replace(/0+$/, "")
      .replace(/\.$/, "")
      .replace(/^-0$/, "0");
  }
  return str;
};

export const decPlaces4 = (flDeg: any): string => {
  return decPlaces(flDeg, 4);
};

export const decPlaces5 = (flDeg: any): string => {
  return decPlaces(flDeg, 5);
};

export const decPlaces6 = (flDeg: any): string => {
  return decPlaces(flDeg, 6);
};

export const degDecHint = (deg: number, prefix: string): string => {
  return `${prefix}: ${decPlaces6(deg)}`;
};

export const tropicalDecHint = (deg: number): string => {
  return degDecHint(deg, "Tropical value");
};

export const standardDecHint = (deg: number): string => {
  return degDecHint(deg, "Decimal value");
};

export const percDec = (flVal: any, places = 3) =>
  decPlaces(flVal, places) + "%";

export const asPerc = (flVal: number, places = 3) =>
  decPlaces(flVal * 100, places) + "%";

export const degDec = (flDeg: any, places = 3) =>
  decPlaces(flDeg, places) + "º";

export const remainder = (flVal: any, places = 3, unit = 100) =>
  decPlaces(unit - flVal, places);

export const percLeft = (flVal: any, places = 3) =>
  remainder(flVal, places, 100) + "%";

export const smartCastFloat = (inval: any, defVal = 0): number => {
  let out = defVal;
  if (isNumeric(inval)) {
    if (typeof inval === "string") {
      out = parseFloat(inval);
    } else if (typeof inval === "number") {
      out = inval;
    }
  }
  return out;
};

export const smartCastInt = (inval: any, defVal = 0): number => {
  return Math.floor(smartCastFloat(inval, defVal));
};

export const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, (match) => {
      return " " + match.toLowerCase();
    })
    .replace(/^./, (match) => {
      return match.toUpperCase();
    })
    .replace(/\b(co)\s+([A-Z])/i, "$1$2");
};

export const snakeToWords = (str: string): string => {
  return str.split(/[-_]+/).join(" ");
};

export const minorWords = ["the", "a", "an", "of"];

export const sanitize = (
  str: string,
  separator = "_",
  maxLen = 128,
  removeWords = true
): string => {
  const minorWordRgx = new RegExp(
    "(^|_)(" + minorWords.join("|") + ")(_|$)",
    "g"
  );
  const sepRgx = new RegExp(separator + "+", "g");
  const endSepRgx = new RegExp(
    "(^" + separator + "+|" + separator + "+$)",
    "g"
  );
  const sourceString = notEmptyString(str) ? str : "";
  let slug = sourceString
    .toLowerCase()
    .trim()
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/ø/g, "o")
    .replace(/ñ/g, "ny")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, separator);
  if (removeWords) {
    slug = slug.replace(minorWordRgx, separator);
  }
  slug = slug.replace(sepRgx, separator).replace(endSepRgx, "");
  if (slug.length > maxLen) {
    slug = slug.substring(0, maxLen).replace(endSepRgx, "");
  }
  return slug;
};

export const cleanString = (str: string, separator = "-") => {
  return sanitize(str, separator, 256, false);
};

/* export const parseDateString = (str: string, mode = "euro"): Date => {
  const parts = str.trim().split(/\s+/);
  let date = "";
  let time = "00:00:00";
  const splitRgx = new RegExp(/[\\/.-]/);
  if (/\d\d\/\d\d\/\d\d\d\d/.test(parts[0])) {
    const dp = parts[0]
      .split(splitRgx)
      .filter(isNumeric)
      .map(parseFloat);
    if (dp.length > 2) {
      date = [dp[2], zeroPad(dp[1]), zeroPad(dp[0])].join("-");
    }
  }
  if (parts.length > 1) {
    const tp = parts[0]
      .split(/[:.]/)
      .filter(isNumeric)
      .map(parseFloat);
    if (tp.length > 2) {
      time = tp.map(zeroPad).join(":");
    }
  }
  if (date.length > 4) {
    return parseISO([date, time].join("T"));
  } else {
    return new Date();
  }
}; */

export const asDateString = (datetime: Date): string => {
  const d = datetime;
  const date = [
    d.getFullYear(),
    zeroPad(d.getMonth() + 1),
    zeroPad(d.getDate()),
  ].join("-");
  const time = [
    zeroPad(d.getHours()),
    zeroPad(d.getMinutes()),
    zeroPad(d.getSeconds()),
  ].join(":");
  return [date, time].join("T");
};

export const applyTzOffset = (dt: Date) => {
  const offset = getGeoTzOffset() * 1000;
  dt.setTime(dt.getTime() + offset);
};

export const toTimeString = (date: Date): string => {
  const hrs = date.getHours();
  const mns = date.getMinutes();
  const scs = date.getSeconds();
  return [zeroPad(hrs), zeroPad(mns), zeroPad(scs)].join(":");
};

export const toDateTime = (strDate: string, applyOffset = true): Date => {
  if (validDateTimeString(strDate)) {
    const dt = parseISO(strDate);
    if (applyOffset) {
      applyTzOffset(dt);
    }
    return dt;
  } else {
    return new Date(0);
  }
};

export const dateToYear = (strDate: string) => {
  if (validDateTimeString(strDate)) {
    const date = toDateTime(strDate);
    return date.getFullYear();
  }
  return 0;
};

export const toMillitime = (strDate: string) => {
  let ts = 0;
  const dt = toDateTime(strDate);
  if (dt) {
    ts = dt.getTime();
  }
  return ts;
};

export const yearYoDateString = (year: any) => {
  if (isNumeric(year)) {
    year = parseInt(year);
    return [year, "07", "01"].join("-") + "T00:00:00";
  }
};

export const formatDate = (datetime: any, fmt: string) => {
  if (datetime) {
    if (!fmt) {
      fmt = "dd/MM/yyyy";
    }
    if (typeof datetime === "string" && validDateTimeString(datetime)) {
      datetime = toDateTime(datetime);
    }
    return format(datetime, fmt);
  }
};

export const longDate = (
  datetime: any,
  offset = 0,
  dateMode = "dmy",
  precision = "s"
) => {
  if (offset !== 0) {
    if (typeof datetime === "string") {
      datetime = toDateTime(datetime);
    }
    if (datetime instanceof Date) {
      datetime = addSeconds(datetime, offset);
    }
  }

  let dateFmt = "dd/MM/yyyy";

  switch (dateMode) {
    case "us":
      dateFmt = "MM/dd/yyyy";
      break;
    case "euro":
      dateFmt = "dd.MM.yyyy";
      break;
    case "iso":
      dateFmt = "yyyy-MM-dd";
      break;
    case "extended":
      dateFmt = "d MMMM YYYY";
      break;
    case "-":
    case "":
    case "none":
      dateFmt = "";
      break;
  }

  let timeFmt = "";
  switch (precision) {
    case "s":
      timeFmt = "HH:mm:ss";
      break;
    case "m":
      timeFmt = "HH:mm";
      break;
  }
  const dtFmt = [dateFmt, timeFmt].join(" ").trim();
  return formatDate(datetime, dtFmt);
};

export const mediumDate = (datetime: any, offset = 0, dateFmt = "dmy") => {
  return longDate(datetime, offset, dateFmt, "m");
};

export const longDateOnly = (datetime: any, offset = 0) => {
  return longDate(datetime, offset, "-", "d");
};

export const mediumDateOnly = (datetime: any, offset = 0) => {
  return longDate(datetime, offset, "dmy", "d");
};

export const longTime = (datetime: any, offset = 0) => {
  return longDate(datetime, offset, "-", "s");
};

export const getAge = (datetime: any) => {
  const currDt = new Date();
  const years = differenceInCalendarYears(currDt, datetime);
  return years;
};

export const toRelativeTime = (datetime: any) => {
  if (datetime) {
    if (typeof datetime === "string" && validDateTimeString(datetime)) {
      datetime = toDateTime(datetime);
    }
    return formatDistanceToNow(datetime, {
      includeSeconds: false,
    });
  }
};

export const toCommas = (value: any) => {
  let str = "";
  if (value instanceof Array) {
    str = value.join(", ");
  }
  return str;
};

export const yesNo = (ref: any = null): string => {
  let str = "";
  switch (typeof ref) {
    case "boolean":
      str = ref ? "yes" : "no";
      break;
    case "number":
      str = ref > 0 ? "yes" : "no";
      break;
    case "string":
      switch (ref.toLowerCase()) {
        case "true":
        case "yes":
          str = "yes";
          break;
        case "false":
        case "no":
          str = "no";
          break;
      }
      break;
  }
  return str;
};

const stripTrailingZeros = (str: string): string => {
  return str.includes(".") ? str.replace(/0+$/, "").replace(/\.$/, "") : str;
};

export const fileSize = (size: number): string => {
  let str = "";
  if (size < 1024) {
    str = size.toString();
  } else if (size < 1024 * 20) {
    str = stripTrailingZeros((size / 1024).toFixed(2)) + " KB";
  } else if (size < 1024 * 100) {
    str = stripTrailingZeros((size / 1024).toFixed(1)) + " KB";
  } else if (size < 1024 * 1024) {
    str = Math.round(size / 1024).toString() + " KB";
  } else if (size < 1024 * 1024 * 10) {
    str = stripTrailingZeros((size / (1024 * 1024)).toFixed(2)) + " MB";
  } else if (size < 1024 * 1024 * 100) {
    str = stripTrailingZeros((size / (1024 * 1024)).toFixed(1)) + " MB";
  } else if (size < 1024 * 1024 * 1024) {
    str = Math.round(size / (1024 * 1204)).toString() + " MB";
  } else {
    str = stripTrailingZeros((size / (1024 * 1024 * 1024)).toFixed(2)) + " GB";
  }
  return str;
};

const toPlanetStationWords = (abbr: string): string => {
  const parts = abbr.split("-").map((w) => {
    switch (w) {
      case "retro":
        w += "grade";
        break;
      case "plus":
        w = "+";
        break;
    }
    return w;
  });
  if (parts.length < 2) {
    parts.unshift("direct");
  }
  return parts.join(" ");
};

export const isALeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const calcMonthYearMeta = (year: number) => {
  const isLeapYear = isALeapYear(year);
  let mds = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365, 396];
  if (isLeapYear) {
    mds = mds.map((md, mi) => (mi > 1 ? md + 1 : md));
  }
  return {
    monthStarts: mds,
    yearLength: isLeapYear ? 366 : 365,
  };
};

export const doubleYearToDateParts = (years: number) => {
  const year = Math.floor(years);
  const { monthStarts, yearLength } = calcMonthYearMeta(year);
  const dayFloat = (years % 1) * yearLength;
  const monthIndex = monthStarts.findIndex((md) => md > dayFloat);
  const monthStart = monthStarts[monthIndex - 1];
  const dayFrac = dayFloat - monthStart;
  const days = Math.round(dayFrac);
  const months = monthIndex;
  const parts = [year.toString()];
  if (months > 0) {
    if (months > 1 || days > 0) {
      parts.push(zeroPad(months, 2));
    }
    if (days > 0) {
      parts.push(zeroPad(days, 2));
    }
  }
  return {
    year,
    months,
    days,
    display: parts.join("-"),
  };
};

export const datePartsToYearDouble = (
  years: number,
  months = 0,
  days = 0
): number => {
  const year = Math.floor(years);
  const { monthStarts, yearLength } = calcMonthYearMeta(year);
  let dbl = year;

  if (months > 0) {
    const monthFrac = monthStarts[months - 1] / yearLength;
    dbl += monthFrac;
    if (days > 0) {
      const dayFrac = (days / yearLength) % 1;
      dbl += dayFrac;
    }
  }
  return dbl;
};

const matchUnitDivisor = (unit: string) => {
  switch (unit.trim().toLowerCase()) {
    case "y":
    case "yrs":
    case "years":
      return 1;
    case "m":
    case "mon":
    case "month":
    case "months":
      return 12;
    case "w":
    case "week":
    case "weeks":
      return 365.25 / 7;
    case "d":
    case "day":
    case "days":
      return 365.25;
    default:
      return 1;
  }
};

export const toStringDuration = (input: number) => {
  const parts = [];
  const years = Math.floor(input);
  const frac = input % 1;
  if (input >= 1) {
    const pl = years > 1 ? "s" : "";
    parts.push(`${years} year${pl}`);
  }
  if (frac > 1 / 12.05) {
    const months = Math.round(frac * 12);
    const pl = months > 1 ? "s" : "";
    parts.push(`${months} month${pl}`);
  } else if (frac > 1 / 52.5) {
    const weeks = Math.round(frac * (365.25 / 7));
    const pl = weeks > 1 ? "s" : "";
    parts.push(`${weeks} week${pl}`);
  }
  return parts.join(" ");
};

export const parseStringDuration = (str: string) => {
  let dbl = 0;
  if (/\d+/.test(str)) {
    str = str
      .toLowerCase()
      .replace(/(\d)([a-z])/g, "$1 $2")
      .replace(/\s\s+/g, " ")
      .trim();

    const parts = str.split(" ");
    const numParts = parts.length;

    if (numParts < 2) {
      if (isNumeric(parts[0])) {
        dbl = smartCastFloat(parts[0]);
      }
    } else {
      const lastIndex = numParts - 1;
      let div = 1;
      for (let i = 0; i < numParts; i++) {
        if (isNumeric(parts[i])) {
          if (i < lastIndex) {
            div = matchUnitDivisor(parts[i + 1]);
            dbl += parseFloat(parts[i]) / div;
          }
        }
      }
    }
  }
  return dbl;
};

export const ordinalNumber = (num: number | string) => {
  const intVal =
    typeof num === "string"
      ? parseInt(num)
      : typeof num === "number"
      ? num
      : -1;
  let suffix = "";
  const lastInt = intVal % 10;
  const inTens = intVal % 100 >= 10 && intVal % 100 < 20;
  switch (lastInt) {
    case -1:
      break;
    case 1:
      suffix = inTens ? "th" : "st";
      break;
    case 2:
      suffix = inTens ? "th" : "nd";
      break;
    case 3:
      suffix = inTens ? "th" : "rd";
      break;
    default:
      suffix = typeof intVal === "number" ? "th" : "";
      break;
  }
  return [num, suffix].join("");
};

export const toPlanetStationLegend = (value: string): string => {
  const [type, abbr] = value.split("__");
  const typeWord = type === "prev" ? "previous" : type;
  const words = [typeWord];
  switch (abbr) {
    case "spot":
      break;
    default:
      words.push(toPlanetStationWords(abbr));
      break;
  }
  return words.join(" ");
};

export const toCharCode = (str: string) => {
  return str.length > 0 ? "U+" + str.charCodeAt(0).toString(16) : "";
};

export const subtractLng360 = (lng: number, offset = 0) =>
  (lng + 360 - offset) % 360;

export const hourMinTz = (offset = 0, alwaysShowMinutes = false) => {
  const secs = Math.abs(offset);
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor(secs / 60) % 60;
  const parts = [offset >= 0 ? "+" : "-", zeroPad(hours, 2)];
  if (alwaysShowMinutes || minutes > 0) {
    parts.push(":");
    parts.push(zeroPad(minutes, 2));
  }
  return parts.join("");
};

export const shortTzAbbr = (
  dt: string | Date,
  timeZone: string,
  offset = -1
) => {
  const datetime = dt instanceof Date ? dt : toDateTime(dt);
  let abbr = "";
  if (notEmptyString(timeZone, 6)) {
    try {
      abbr = formatToTimeZone(datetime, "z", {
        timeZone,
      });
    } catch (e) {
      abbr = "XXX";
    }
  }
  let str = "";
  if (abbr) {
    switch (abbr) {
      case "+00":
        abbr = "GMT";
        break;
    }
    str = abbr;
  } else if (offset !== -1) {
    str = hourMinTz(offset);
  }
  return offset > -2 ? str : /^[A-Z]+$/i.test(str) ? str : "";
};

export const weekDayNum = (
  dt: Date | string,
  dayBefore = false,
  startZero = true
): number => {
  let datetime = dt instanceof Date ? dt : toDateTime(dt);
  if (dayBefore === true) {
    datetime = subDays(datetime, 1);
  }
  const isoNum = getISODay(datetime);
  return startZero
    ? isoNum < 7 && isoNum > 0
      ? isoNum - 1
      : isoNum % 7
    : isoNum;
};

export const weekDayNumIso = (dt: Date | string, dayBefore = false): number => {
  return weekDayNum(dt, dayBefore, false);
};

export const fromUnixTs = (ts: number) => {
  return new Date(ts * 1000);
};

export const getLocaleOffsetSecs = () => {
  const mins = new Date().getTimezoneOffset();
  // need to investigate why this hour offset is necessary
  // for non-UTC locales
  // return mins !== 0 ? (mins + 60) * 60 : 0;
  return mins !== 0 ? mins * 60 : 0;
};

export const julToISODateObj = (
  jd: number,
  tzOffset = 0,
  applyDateOffset = false
): Date => {
  const diff = getGeoTzOffset();
  const localeOffset = applyDateOffset ? diff : 0;
  return !isNaN(jd)
    ? fromUnixTime(julToUnixTime(jd, tzOffset + localeOffset))
    : fromUnixTime(0);
};

export const julToISODate = (
  jd: number,
  tzOffset = 0,
  applyDateOffset = false
): string => {
  return julToISODateObj(jd, tzOffset, applyDateOffset).toISOString();
};

export const julToDateFormatValid = (
  jd: number,
  tzOffset = 0,
  fmt = "euro1",
  timeOptions = {
    time: true,
    seconds: true,
  }
): string => {
  const jDate = julToDateParts(jd, tzOffset);
  return jDate.format(fmt, timeOptions);
};

export const julToDateFormat = (
  jd: number,
  tzOffset = 0,
  fmt = "euro1",
  timeOptions = {
    time: true,
    seconds: true,
  }
): string => {
  return jd > 1000 ? julToDateFormatValid(jd, tzOffset, fmt, timeOptions) : "-";
};

export const julToLongDate = (
  jd: number,
  tzOffset: number,
  seconds = true
): string => {
  return julToDateFormat(jd, tzOffset, "dmy", { time: true, seconds });
};

export const julToDateOnly = (jd: number, tzOffset: number) => {
  return julToDateFormat(jd, tzOffset, "dmy", { time: false, seconds: false });
};

export const julToFullDateOnly = (jd: number, tzOffset: number) => {
  return julToDateFormat(jd, tzOffset, "extended", {
    time: false,
    seconds: false,
  });
};

export const julToDayMonth = (jd: number, tzOffset: number) => {
  return julToDateFormat(jd, tzOffset, "dm", { time: false, seconds: false });
};

export const julToMediumDate = (jd: number, tzOffset: number) => {
  return julToDateFormat(jd, tzOffset, "dmy", { time: true, seconds: false });
};

export const julToHMS = (jd: number, tzOffset = 0) => {
  return julToDateFormat(jd, tzOffset, "", { time: true, seconds: true });
};

export const julToHM = (jd: number, tzOffset = 0) => {
  return julToDateFormat(jd, tzOffset, "", { time: true, seconds: false });
};

export const shortTzAbbrJd = (jd: number, timeZone: string, offset = -1) => {
  const dt = julToISODate(jd, offset);
  return shortTzAbbr(dt, timeZone);
};

export const relativeAngle = (
  sunLng: number,
  moonLng: number,
  multiplier = 1
) => {
  const mn = ((moonLng - sunLng) * multiplier) % 360;
  return mn < 0 ? 360 + mn : mn;
};

/*
Check the seconds component of datetimes stored as Julian dates
*/
export const correctTimeFromJul = (jd = 0, tzOffset = 0, datetime: Date) => {
  const secs = datetime?.toISOString().split(".")?.shift()?.split(":").pop();
  let timeVal = julToHMS(jd, tzOffset);
  const iSecs = parseInt(secs as string);
  if (iSecs < 59) {
    timeVal = timeVal
      .split(":")
      .map((tp, ti) => (ti === 2 ? secs : tp))
      .join(":");
  }
  return timeVal;
};

export const julRangeToInterval = (
  startJd: number,
  endJd: number,
  tzOffset = 0
) => {
  const duration = intervalToDuration({
    start: julToISODateObj(startJd, tzOffset),
    end: julToISODateObj(endJd, tzOffset),
  });
  const negative = startJd > endJd;
  return { ...duration, negative };
};

export const approxDateParts = (dateStr: string): number[] => {
  const parts = dateStr.split(/[./-]/).map(smartCastInt);
  if (parts.length < 3) {
    if (parts.length < 2) {
      parts.push(0);
    }
    parts.push(0);
  }
  return parts;
};

export const matchYearDouble = (strDate = "") => {
  const [sYear, sMonth, sDay] = approxDateParts(strDate);
  return strDate.length > 3 ? datePartsToYearDouble(sYear, sMonth, sDay) : -1;
};

export const isoDateStringToSimple = (dtStr: string, timePrecision = "m") => {
  const parts = dtStr.split("T");
  const outParts = [];
  if (parts.length > 1) {
    const date = parts.shift()?.split("-").reverse().join("/");
    outParts.push(date);
    let end = 0;
    switch (timePrecision) {
      case "h":
        end = 1;
        break;
      case "m":
        end = 2;
        break;
      case "s":
        end = 3;
        break;
    }
    if (end > 0) {
      const tp = parts.pop()?.split(".").shift()?.split(":");
      outParts.push(tp?.slice(0, end).join(":"));
    }
  }
  return outParts.join(" ");
};

export const offsetStringToSeconds = (str: string): number => {
  const parts = typeof str === "string" ? str.split(":") : [];
  let hrs = 0;
  let mins = 0;
  if (parts.length > 0) {
    hrs = smartCastInt(parts[0]);
    if (parts.length > 1) {
      mins = smartCastInt(parts[1]);
    }
  }
  return hrs * 3600 + mins * 60;
};

export const hrsMinsToString = (
  hrs = 0,
  mins = 0,
  seconds = 0,
  showPlus = true
) => {
  const hrsInt = typeof hrs === "number" ? Math.abs(hrs) : 0;
  const hrsStr = hrsInt.toString();
  const prefix = showPlus
    ? (hrs > 0 && mins >= 0) || (hrs === 0 && mins > 0)
      ? "+"
      : hrs < 0 || mins < 0
      ? "-"
      : ""
    : "";
  const parts = [`${prefix}${hrsStr}h`];
  if (mins > 0) {
    parts.push(`${Math.abs(mins)}m`);
  }
  if (seconds > 0) {
    parts.push(`${Math.abs(seconds)}s`);
  }
  return parts.join(" ").trim();
};

export const secsToString = (secs = 0, showPlus = true) => {
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor(secs / 60) % 60;
  const seconds = Math.floor(secs) % 60;
  return hrsMinsToString(hrs, mins, seconds, showPlus);
};

export const secsToPeriod = (secs = 0) => {
  return secsToString(secs, false);
};

export const percent = (proportion = 0, places = 3): string => {
  const perc = smartCastFloat(proportion) * 100;
  return decPlaces(perc, places) + "%";
};

export const extractPlaceString = (placenames: any[]) => {
  if (placenames instanceof Array) {
    const numPns = placenames.length;
    const lastPn = placenames[numPns - 1];
    if (lastPn instanceof Object && notEmptyString(lastPn.name)) {
      return `${lastPn.name}, ${lastPn.adminName} (${lastPn.countryCode})`;
    }
  }
  return "N/A";
};
