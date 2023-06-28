import { notEmptyString } from "./utils";

const matchesPattern = (str = "", pattern = "", mode = "i"): boolean => {
  const rgx = new RegExp("^" + pattern + "$", mode);
  console.log(rgx, str);
  return rgx.test(str);
};

export const updateInputValue = (
  e: Event,
  func: Function,
  validPattern = ""
) => {
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
