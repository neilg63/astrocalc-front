import { snakeToWords } from "./converters";
import { KeyNumName, KeyNumValue } from "./models";

export interface KeyName {
  key: string;
  name: string;
}

export interface KeyNameNum {
  key: string;
  name: string;
  num: number;
}

export const ayanamshas: KeyNameNum[] = [
  {
    key: "",
    name: "tropical",
    num: 0,
  },
  {
    key: "tc",
    name: "true_citra",
    num: 27,
  },
  {
    key: "lh",
    name: "lahiri",
    num: 1,
  },
  {
    key: "kr",
    name: "krishnamurti",
    num: 5,
  },
  {
    key: "yu",
    name: "yukteshwar",
    num: 7,
  },
  {
    key: "ra",
    name: "raman",
    num: 3,
  },
  {
    key: "vm",
    name: "valensmoon",
    num: 42,
  },
  {
    key: "tm",
    name: "true_mula",
    num: 35,
  },
  {
    key: "tr",
    name: "true_revati",
    num: 28,
  },
  {
    key: "tp",
    name: "true_pushya",
    num: 29,
  },
  {
    key: "ts",
    name: "true_sheoran",
    num: 39,
  },
  {
    key: "at",
    name: "aldebaran_15_tau",
    num: 14,
  },
  {
    key: "gc",
    name: "galcent_cochrane",
    num: 40,
  },
  {
    key: "hi",
    name: "hipparchos",
    num: 15,
  },
  {
    key: "sa",
    name: "sassanian",
    num: 16,
  },
  {
    key: "us",
    name: "ushashashi",
    num: 4,
  },
  {
    key: "jb",
    name: "jnbhasin",
    num: 8,
  },
];

const matchFuncNum = (r: KeyNameNum, num: number) => r.num === num;

const matchFuncString = (r: KeyNameNum, key: string) =>
  r.key === key || r.name === key;

const matchByAyaRef = (
  keyRef: number | string,
  matchFunc: Function
): KeyNameNum => {
  const row = ayanamshas.find((r) => matchFunc(r, keyRef));
  if (row instanceof Object) {
    return row;
  } else {
    return {
      key: "",
      name: "",
      num: -1,
    };
  }
};

export const matchAyaNum = (num: number): KeyNameNum => {
  return matchByAyaRef(num, matchFuncNum);
};

export const matchAyaKey = (key: string): KeyNameNum => {
  return matchByAyaRef(key, matchFuncString);
};

export const matchAyaNameByNum = (num: number): string => {
  return snakeToWords(matchAyaNum(num).name);
};

export const matchAyaNameByKey = (key: string): string => {
  return snakeToWords(matchAyaKey(key).name);
};

export interface RelationSet {
  enemies: number[];
  friends: number[];
  neutral: number[];
}

export interface GrahaAttrSet {
  key: string;
  astro_num: number;
  name: string;
}

export const bodies: GrahaAttrSet[] = [
  {
    astro_num: 0,
    key: "su",
    name: "Sun",
  },
  {
    astro_num: 1,
    key: "mo",
    name: "Moon"
  },
  {
    astro_num: 2,
    key: "me",
    name: "Mercury",
  },
  {
    astro_num: 3,
    key: "ve",
    name: "Venus",
  },
  {
    astro_num: 4,
    key: "ma",
    name: "Mars",
  },
  {
    astro_num: 5,
    key: "ju",
    name: "Jupiter"
  },
  {
    astro_num: 6,
    key: "sa",
    name: "Saturn",
  },
  {
    astro_num: 11,
    key: "ke",
    name: "South Node (Ketu)",
  },
  {
    astro_num: 7,
    key: "ur",
    name: "Uranus",
  },
  {
    astro_num: 8,
    key: "ne",
    name: "Neptune"
  },
  {
    astro_num: 9,
    key: "pl",
    name: "Pluto",
  },
  {
    astro_num: 14,
    key: "ea",
    name: "Earth",
  },
  {
    astro_num: 10,
    key: "mn",
    name: "MeanNode",
  },
  {
    astro_num: 43,
    key: "kr",
    name: "Kronos",
  },
  {
    astro_num: 48,
    key: "is",
    name: "Isis",
  },
  {
    astro_num: 19,
    key: "jn",
    name: "Juno",
  },
  {
    astro_num: 17,
    key: "ce",
    name: "Ceres",
  },
  {
    astro_num: 15,
    key: "ch",
    name: "Chiron",
  },
  {
    astro_num: 24,
    key: "sn",
    name: "SouthNode",
  },
  {
    astro_num: -1,
    key: "as",
    name: "Ascendant",
  },
];

const matchByGrahaRef = (
  keyRef: number | string,
  matchFunc: Function
): GrahaAttrSet => {
  const row = bodies.find((r) => matchFunc(r, keyRef));
  if (row instanceof Object) {
    return row;
  } else {
    return {
      astro_num: -1,
      key: "",
      name: "",
    };
  }
};

export const matchByGrahaKey = (key: string): GrahaAttrSet => {
  return matchByGrahaRef(key, matchFuncString);
};

export const matchNameByGrahaKey = (key: string): string => {
  return matchByGrahaKey(key).name;
};

export const houseSystems = [
  { key: "W", name: "Whole sign equal" },
  { key: "A", name: "Equal" },
  { key: "B", name: "Alcabitius" },
  { key: "C", name: "Campanus" },
  // { key: "D", name: "equal (MC)" },
  // { key: "E", name: "equal" },
  // { key: "F", name: "Carter poli-equ." },
  { key: "G", name: "Gauquelin sectors" },
  { key: "H", name: "horizon/azimut" },
  // { key: "I", name: "Sunshine" },
  // { key: "J", name: "Sunshine/alt." },
  { key: "K", name: "Koch" },
  // { key: "L", name: "Pullen SD" },
  { key: "M", name: "Morinus" },
  // { key: "N", name: "Equal/1=Aries" },
  { key: "O", name: "Porphyry" },
  // { key: "Q", name: "Pullen SR" },
  { key: "R", name: "Regiomontanus" },
  // { key: "S", name: "Sripati" },
  { key: "T", name: "Polich/Page" },
  // { key: "U", name: "Krusinski-Pisa-Goelzer" },
  // { key: "V", name: "equal/Vehlow" },
  { key: "X", name: "Axial rotation / Meridian" },
  // { key: "Y", name: "APC houses" },
];

export const matchByHouseKey = (key: string): string => {
  const row = houseSystems.find((row) => row.key === key);
  if (row instanceof Object) {
    return row.name;
  } else {
    return key;
  }
};

export const weekDayName = (num = 1, mode = "iso") => {
  const isoNum = mode === "sun" ? (num === 1 ? 7 : num - 1) : num;
  switch (isoNum) {
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
      return "-";
  }
};

export const weekDayNameSun = (num = 1) => weekDayName(num, "sun");

interface SectionModeSet {
  section: string;
  modes: KeyName[];
}

export const modeOptions: SectionModeSet[] = [
  {
    section: "transitions",
    modes: [
      { key: "extended", name: "Extended" },
      { key: "sun", name: "Sun" },
      { key: "transposed", name: "Transposed" },
    ],
  },
];

export const matchSectionModes = (key = ""): KeyName[] => {
  const row = modeOptions.find((row) => row.section === key);
  if (row instanceof Object) {
    if (row.modes instanceof Array) {
      return row.modes;
    }
  }
  return [];
};

export const unitOptions: KeyNumName[] = [
  {
    key: "day",
    name: "Days",
    value: 1,
  },
  {
    key: "week",
    name: "Weeks",
    value: 7,
  },
  {
    key: "moon",
    name: "Lunar month",
    value: 28,
  },
  {
    key: "quarter",
    name: "Quarters",
    value: 92,
  },
  {
    key: "year",
    name: "Years",
    value: 365.25,
  },
];

export const unitKeyToObject = (key = ""): KeyNumName => {
  const row = unitOptions.find((r) => r.key === key);
  if (row instanceof Object) {
    return row;
  } else {
    return { key: "", name: "", value: 0 };
  }
};

export const matchUnitKeyByValue = (value = 0): string => {
  const minVal = value * 0.9;
  const maxVal = value * 1.1;
  const row = unitOptions.find((r) => r.value > minVal && r.value < maxVal);
  if (row instanceof Object) {
    return row.key;
  } else {
    return "";
  }
};

export const unitKeyToDays = (key = ""): number => {
  const row = unitKeyToObject(key);
  if (row.value > 0) {
    return row.value;
  } else {
    return 1;
  }
};

export const matchUnitsBySection = (key = ""): KeyNumName[] => {
  switch (key) {
    case "extended":
      return unitOptions;
    case "transitions":
      return unitOptions.filter((row) => row.value < 100);
    default:
      return [];
  }
};

export const eqOptions: KeyNumName[] = [
  {
    key: "ecliptic",
    name: "Ecliptic",
    value: 0,
  },
  {
    key: "equatorial",
    name: "Equatorial",
    value: 1,
  },
  {
    key: "horizontal",
    name: "Horizontal",
    value: 3,
  },
];

export const toEqInt = (key: string) => {
  switch (key) {
    case "equatorial":
      return 1;
    case "horizontal":
      return 3;
    default:
      return 0;
  }
};

export const toEqKey = (value = 0) => {
  switch (value) {
    case 1:
      return "equatorial";
    case 3:
      return "horizontal";
    default:
      return "ecliptic";
  }
};

export const toTopoKey = (value = false) => {
  return value ? "topocentric" : "geocentric";
};

export const showEqOptions = (key = ""): boolean => {
  switch (key) {
    case "extended":
      return true;
    default:
      return false;
  }
};
