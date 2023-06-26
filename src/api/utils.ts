import { format } from "date-fns";

export const isNumeric = (num: any): boolean => {
  const dt = typeof num;
  if (
    num !== null &&
    num !== undefined &&
    (dt === "number" || dt === "string")
  ) {
    return !isNaN(parseFloat(num)) && isFinite(num);
  } else {
    return false;
  }
};

export const notEmptyString = (str: any = null, minLength = 1): boolean => {
  if (typeof str === "string") {
    const absMin = minLength > 0 ? minLength : 1;
    return str.trim().length >= minLength;
  }
  return false;
};

export const isObjectWith = (obj: any = null, field = ""): boolean => {
  return obj instanceof Object && Object.keys(obj).includes(field);
};

export const isObjectWithArray = (obj: any = null, field = ""): boolean => {
  return isObjectWith(obj, field) && obj[field] instanceof Array;
};

export const isObjectWithObject = (obj: any = null, field = ""): boolean => {
  return (
    isObjectWith(obj, field) &&
    obj[field] instanceof Object &&
    !(obj[field] instanceof Array)
  );
};

export const isObjectWithString = (obj: any = null, field = ""): boolean => {
  return isObjectWith(obj, field) && typeof obj[field] === "string";
};

export const validISODateString = (str: string): boolean => {
  if (notEmptyString(str, 4)) {
    return /^-?\d{1,4}-\d\d-\d\d((T|\s)\d\d:\d\d(:\d\d)?)?/.test(str);
  } else {
    return false;
  }
};

export const validDateTimeString = (
  date: string,
  withTime = false
): boolean => {
  let valid = typeof date === "string";
  if (valid) {
    let pattern = "^s*[12]\\d\\d\\d-[0-1]?\\d-[0-3]\\d?";
    if (withTime === true) {
      pattern += `(T|\\s)[0-2]?\\d:[0-5]?\\d:[0-5]?\\d(\\.\\d+)?Z?`;
    }
    pattern += "\\s*$";
    const rgx = new RegExp(pattern, "i");
    valid = rgx.test(date);
  }
  return valid;
};

export const extractRendered = (obj: any, field = ""): string => {
  if (
    isObjectWithObject(obj, field) &&
    isObjectWithString(obj[field], "rendered")
  ) {
    return obj[field]["rendered"];
  } else {
    return "";
  }
};

export const extractExcerpt = (obj: any) => {
  return extractRendered(obj, "excerpt").replace(
    /\[.*?\]\s*(<\/\w+>\s*)*$/gi,
    "$1"
  );
};

const translateDateFormatCode = (mode = "short"): string => {
  switch (mode) {
    case "medium":
      return "d MMM yyyy";
    case "long":
      return "EEEE d MMMM yyyy";
    default:
      return "dd/MM/yyyy";
  }
};

export const daysAgo = (days = 0): Date => {
  const dayMs = 24 * 60 * 60 * 1000;
  const msInDays = dayMs * days;
  const nowTs = new Date().getTime();
  return new Date(nowTs - msInDays);
};

export const yearsAgo = (years = 0): Date => {
  const days = years * 365.25;
  return daysAgo(days);
};

export const yearsAgoDateString = (years = 0): string => {
  const dtParts = yearsAgo(years).toISOString().split("T");
  if (dtParts.length > 1 && typeof dtParts[1] === "string") {
    return dtParts[0];
  } else {
    return "";
  }
};

export const formatDate = (dtRef: Date | string, mode = "short") => {
  const dt = dtRef instanceof Date ? dtRef : new Date(dtRef);
  const code = translateDateFormatCode(mode);
  return format(dt, code);
};

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

export const zeroPad2 = (inval: number | string): string => {
  return zeroPad(inval, 2);
};

export interface DateParamFiler {
  apply: boolean;
  before: string;
  after: string;
}

export const renderDateRange = (year = 0, month = 0): DateParamFiler => {
  let apply = false;
  let before = "";
  let after = "";
  if (year > 1000) {
    apply = true;
    if (month > 0) {
      const m = zeroPad2(month);
      const nM = month < 12 ? month + 1 : 1;
      const nextM = zeroPad2(nM);
      const nYear = month < 12 ? year : year + 1;
      before = `${nYear}-${nextM}-01T00:00:00`;
      after = `${year}-${m}-01T00:00:00`;
    } else {
      const nYear = year + 1;
      before = `${nYear}-01-01T00:00:00`;
      after = `${year}-01-01T00:00:00`;
    }
  }
  return { apply, before, after };
};

export const cleanText = (text: string): string => {
  if (typeof text === "string") {
    return text
      .replace(/(&#8217;)/, "'")
      .replace(/(&#8211;)/, "⸺")
      .replace(/&#8230;/, "...");
  } else {
    return "";
  }
};

export const renderNextLabel = (page = 2) => `Next (page ${page})`;

export const renderPageLink = (page = 2) => `/list/${page}`;

export const cleanSearchString = (text: string): string => {
  if (typeof text === "string" && encodeURIComponent instanceof Function) {
    return encodeURIComponent(
      text.replace(/[^a-z0-9àáéèêîïìùüûìëøöóòñõãß"-]+/gi, " ")
    );
  } else {
    return "";
  }
};

export const stripHtml = (text = ""): string => {
  if (notEmptyString(text)) {
    return text
      ?.replace(/<\/?\w[^>]*?>/g, " ")
      .replace(/\s\s+/g, " ")
      .trim();
  } else {
    return "";
  }
};

export const correctHtml = (text = ""): string => {
  if (notEmptyString(text)) {
    return text
      ?.replace(
        /<div[^>]+wp-block-embed__wrapper[^>]*?>\s*(http[^<]+?you[^<]+?)\s*<\/div>/gi,
        `<iframe src="$1" width="100%" style="min-height: 5rem; width: 100%;aspect-ratio: 4/3"></iframe>`
      )
      .trim();
  } else {
    return "";
  }
};
