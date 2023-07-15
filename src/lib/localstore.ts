export const localStoreSupported = (): boolean => {
  return typeof localStorage !== "undefined";
};

export const toLocal = (key = "", data: any = null) => {
  const ts = Date.now() / 1000;
  let sd = ts + ":";
  if (data !== null && localStoreSupported()) {
    if (typeof data === "object") {
      sd += "obj:" + JSON.stringify(data);
    } else {
      sd += "sca:" + data;
    }
    localStorage.setItem(key, sd);
  }
};

export const fromLocal = (key = "", maxAge = 3600) => {
  const ts = Date.now() / 1000;
  const obj: any = {
    expired: true,
    valid: false,
  };
  if (!maxAge) {
    maxAge = 60 * 60;
  }
  if (localStoreSupported()) {
    const data = localStorage.getItem(key);
    if (data) {
      let parts = data.split(":");
      if (parts.length > 2) {
        obj.ts = parts.shift();
        obj.ts = obj.ts - 0;
        obj.type = parts.shift();
        obj.data = parts.join(":");

        if (obj.type === "obj") {
          obj.data = JSON.parse(obj.data);
        }
        const latestTs = obj.ts + maxAge;
        if (ts <= latestTs) {
          obj.expired = false;
          obj.valid = true;
        }
      }
    }
  }
  return obj;
};

export const fromLocalDays = (key = "", days = 1) => {
  return fromLocal(key, days * 24 * 60 * 60);
};

export const clearLocal = (key = "", fuzzy = false) => {
  if (localStoreSupported()) {
    const keys = Object.keys(localStorage);
    if (fuzzy !== true) {
      fuzzy = false;
    }
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      if (fuzzy) {
        const rgx = new RegExp("^" + key);
        if (rgx.test(k)) {
          localStorage.removeItem(k);
        }
      } else if (k === key || key === "all") {
        switch (k) {
          case "current-user":
            break;
          default:
            localStorage.removeItem(k);
            break;
        }
      }
    }
  }
};
