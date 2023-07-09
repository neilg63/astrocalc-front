import { smartCastInt } from "./converters";
import { isNumeric, notEmptyString } from "./utils";

const matchesPattern = (str = "", pattern = "", mode = "i"): boolean => {
  const rgx = new RegExp("^" + pattern + "$", mode);
  return rgx.test(str);
};

export const updateInputValue = (e: Event, func: Function, isDate = true) => {
  const validPattern = isDate
    ? "\\d\\d\\d\\d-[012][0-9]-[0123][0-9]"
    : "[012][0-9]:[0-5][0-9](:[0-5][0-9])?";
  if (e.target instanceof HTMLInputElement) {
    if (e.target.value !== undefined) {
      const valid = notEmptyString(validPattern)
        ? matchesPattern(e.target.value, validPattern)
        : true;
      if (valid) {
        func(e.target.value);
      }
    }
  }
};

export const updateIntValue = (e: Event, func: Function) => {
  if (e.target instanceof HTMLInputElement) {
    const { value } = e.target;
    if (value !== undefined && isNumeric(value)) {
      func(smartCastInt(value, 0));
    }
  }
};
