import { astroCalcBase, geoTimeBase } from "./settings";
import { notEmptyString, renderDateRange } from "./utils";
import { ParamSet } from "./interfaces";

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
  const keys = Object.entries(params);
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

export const fetchTz = async (dt: string, loc: string): Promise<any> => {
  const method = `timezone`;
  const params = {
    dt,
    loc,
  };
  return await fetchContentGeo(method, params);
};

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