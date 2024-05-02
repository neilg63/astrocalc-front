import { astroCalcBase, geoTimeBase } from "./settings";
import { isNumeric, notEmptyString, renderDateRange } from "./utils";
import { ParamSet } from "./interfaces";
import { smartCastInt, yearToISODateTime } from "./converters";

const matchService = (service = "") => {
  switch (service) {
    case "gtz":
    case "geo":
      return geoTimeBase;
    default:
      return astroCalcBase;
  }
};

const buildUri = (service = "", method = "") => {
  return [matchService(service), method].join("/");
};

const buildQueryString = (params: ParamSet): string => {
  const parts = Object.entries(params)
    .filter((entry) => {
      return entry[1] !== null && entry[1] !== undefined;
    })
    .map(([key, value]) => {
      return `${key}=${value}`;
    });
  return parts.length > 0 ? "?" + parts.join("&") : "";
};

export const fetchContentRemote = async (
  method: string,
  params: ParamSet,
  service = ""
): Promise<any> => {
  const qStr = buildQueryString(params);
  const remote = method.startsWith("https://") || method.startsWith("http://");
  const uriString = method + qStr;
  const uri = remote ? uriString : buildUri(service, uriString);
  const response = await fetch(uri);
  return await response.json();
};

export const fetchContentAstro = async (
  method: string,
  params: ParamSet
): Promise<any> => {
  return await fetchContentRemote(method, params, "asc");
};

export const fetchContentGeo = async (
  method: string,
  params: ParamSet
): Promise<any> => {
  return await fetchContentRemote(method, params, "geo");
};

export const fetchChartData = async (params: ParamSet): Promise<any> => {
  const method = `chart-data`;
  const keys = Object.keys(params);
  if (keys.length < 2) {
    params = {
      dt: "1978-06-28T11:30:30",
      loc: "45.15,-13.667",
      ct: 1,
      eq: 0,
      topo: 2,
      sid: 1,
    };
  }
  return await fetchContentAstro(method, params);
};

export const fetchProgressData = async (params: ParamSet): Promise<any> => {
  const method = `progress`;
  const filter: Map<string, any> = new Map(Object.entries(params));
  filter.set("sid", 0);
  if (filter.has("aya")) {
    const aya = filter.get("aya");
    if (notEmptyString(aya) && aya.length === 2 && aya !== "--") {
      filter.set("sid", 1);
      filter.set("aya", aya);
    }
  }
  if (filter.has("topo")) {
    const topo = filter.get("topo");
    filter.set("topo", topo === true ? 1 : 0);
  } else {
    filter.set("topo", 0);
  }
  if (filter.has("eq")) {
    const eq = filter.get("eq");
    if (isNumeric(eq)) {
      filter.set("eq", smartCastInt(eq, 0));
    }
  } else {
    filter.set("eq", 0);
  }

  if (filter.has("days")) {
    const days = filter.get("days");
    if (isNumeric(days)) {
      filter.set("days", smartCastInt(days, 10));
    }
  }
  return await fetchContentAstro(method, Object.fromEntries(filter.entries()));
};

export const fetchTz = async (
  dt: string,
  loc: string,
  addPlaceNames = false
): Promise<any> => {
  const method = addPlaceNames ? `gtz` : `timezone`;
  const params = {
    dt,
    loc,
  };
  return await fetchContentGeo(method, params);
};

export const fetchGeoTz = async (dt: string, loc: string): Promise<any> =>
  fetchTz(dt, loc, true);

export const searchLocation = async (place: string, cc = ""): Promise<any> => {
  const method = `lookup`;
  const params = {
    place,
    cc,
    fuzzy: 100,
    max: 30,
  };
  return await fetchContentGeo(method, params);
};

export const fetchExtendedRiseSetTimes = async (
  params: ParamSet,
  sunMode = false
): Promise<any> => {
  const filter: Map<string, any> = new Map(Object.entries(params));
  const baseName = "rise-set-times";
  const method = sunMode ? ["sun", baseName].join("-") : baseName;
  return await fetchContentAstro(method, Object.fromEntries(filter.entries()));
};

export const fetchSunRiseSetTimes = async (params: ParamSet): Promise<any> => {
  return await fetchExtendedRiseSetTimes(params, true);
};

export const fetchOrbitPhases = async (
  params: ParamSet,
  sunMode = false
): Promise<any> => {
  const filter: Map<string, any> = new Map(Object.entries(params));
  const hasStart = filter.has("dt");
  const hasEnd = filter.has("dt2");
  if (!hasStart || !hasEnd) {
    const currYear = new Date().getFullYear();
    if (!hasStart) {
      const startYear = currYear - 50;
      const dt = yearToISODateTime(startYear);
      filter.set("dt", dt);
    }
    if (!hasEnd) {
      const endYear = currYear + 20 + 1;
      const dt2 = yearToISODateTime(endYear);
      filter.set("dt2", dt2);
    }
  }
  const method = "planet-station";
  return await fetchContentAstro(method, Object.fromEntries(filter.entries()));
};
