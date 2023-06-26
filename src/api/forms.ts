export const updateInputValue = (e: Event, func: Function) => {
  if (e.target instanceof HTMLInputElement) {
    if (e.target.value !== undefined) {
      func(e.target.value);
    }
  }
};
