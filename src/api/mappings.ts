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
  jyotish_num: number;
  name: string;
  opposition: string;
  chara_karaka_mode?: string;
  dosha?: string[];
  element?: string;
  exalted_degree?: number;
  gender?: string;
  guna?: string;
  mula_trikon?: number[];
  nature?: string;
  own_sign?: number[];
  relations?: RelationSet;
}

export const bodies: GrahaAttrSet[] = [
  {
    astro_num: 0,
    chara_karaka_mode: "forward",
    dosha: ["Pitta"],
    element: "None",
    exalted_degree: 10.0,
    gender: "Male",
    guna: "Sat",
    jyotish_num: 1,
    key: "su",
    mula_trikon: [0.0, 10.0],
    name: "Sun",
    nature: "Malefic",
    opposition: "-",
    own_sign: [5],
    relations: {
      enemies: [6, 7],
      friends: [2, 3, 5],
      neutral: [4],
    },
  },
  {
    astro_num: 1,
    chara_karaka_mode: "forward",
    dosha: ["Vata", "Kapha"],
    element: "None",
    exalted_degree: 33.0,
    gender: "Female",
    guna: "Sat",
    jyotish_num: 2,
    key: "mo",
    mula_trikon: [4.0, 30.0],
    name: "Moon",
    nature: "Dual",
    opposition: "-",
    own_sign: [4],
    relations: {
      enemies: [],
      friends: [1, 4],
      neutral: [3, 5, 6, 7],
    },
  },
  {
    astro_num: 2,
    chara_karaka_mode: "forward",
    dosha: ["Vata", "Pitta", "Kapha"],
    element: "Earth",
    exalted_degree: 165.0,
    gender: "None",
    guna: "Rajas",
    jyotish_num: 4,
    key: "me",
    mula_trikon: [16.0, 20.0],
    name: "Mercury",
    nature: "Dual",
    opposition: "-",
    own_sign: [3, 6],
    relations: {
      enemies: [2],
      friends: [1, 6],
      neutral: [3, 5, 7],
    },
  },
  {
    astro_num: 3,
    chara_karaka_mode: "forward",
    dosha: ["Kapha", "Vata"],
    element: "Water",
    exalted_degree: 357.0,
    gender: "Female",
    guna: "Rajas",
    jyotish_num: 6,
    key: "ve",
    mula_trikon: [0.0, 15.0],
    name: "Venus",
    nature: "Benefic",
    opposition: "-",
    own_sign: [2, 7],
    relations: {
      enemies: [1, 2],
      friends: [4, 7],
      neutral: [3, 5],
    },
  },
  {
    astro_num: 4,
    chara_karaka_mode: "forward",
    dosha: ["Pitta"],
    element: "Fire",
    exalted_degree: 298.0,
    gender: "Male",
    guna: "Tamas",
    jyotish_num: 3,
    key: "ma",
    mula_trikon: [0.0, 12.0],
    name: "Mars",
    nature: "Malefic",
    opposition: "-",
    own_sign: [1, 8],
    relations: {
      enemies: [4],
      friends: [1, 2, 5],
      neutral: [6, 7],
    },
  },
  {
    astro_num: 5,
    chara_karaka_mode: "forward",
    dosha: ["Kapha"],
    element: "Space",
    exalted_degree: 95.0,
    gender: "Male",
    guna: "Sat",
    jyotish_num: 5,
    key: "ju",
    mula_trikon: [0.0, 10.0],
    name: "Jupiter",
    nature: "Benefic",
    opposition: "-",
    own_sign: [9, 12],
    relations: {
      enemies: [4, 6],
      friends: [1, 2, 3],
      neutral: [7],
    },
  },
  {
    astro_num: 6,
    chara_karaka_mode: "forward",
    dosha: ["Vata"],
    element: "Air",
    exalted_degree: 200.0,
    gender: "None",
    guna: "Tamas",
    jyotish_num: 7,
    key: "sa",
    mula_trikon: [0.0, 20.0],
    name: "Saturn",
    nature: "Malefic",
    opposition: "-",
    own_sign: [10, 11],
    relations: {
      enemies: [1, 2, 3],
      friends: [4, 6],
      neutral: [5],
    },
  },
  {
    astro_num: 11,
    chara_karaka_mode: "reverse",
    dosha: ["Vata"],
    element: "None",
    exalted_degree: 50.0,
    gender: "None",
    guna: "Tamas",
    jyotish_num: 8,
    key: "ra",
    mula_trikon: [0.0, 20.0],
    name: "Rahu",
    nature: "Malefic",
    opposition: "-",
    own_sign: [11, 6],
    relations: {
      enemies: [1, 2, 3],
      friends: [6, 7, 9, 4],
      neutral: [5],
    },
  },
  {
    astro_num: 11,
    chara_karaka_mode: "none",
    dosha: ["Pitta"],
    element: "None",
    exalted_degree: 230.0,
    gender: "None",
    guna: "Tamas",
    jyotish_num: 8,
    key: "ke",
    mula_trikon: [0.0, 20.0],
    name: "Ketu",
    nature: "Malefic",
    opposition: "ra",
    own_sign: [8, 12],
    relations: {
      enemies: [1, 2],
      friends: [3, 5, 6],
      neutral: [4, 8, 7],
    },
  },
  {
    astro_num: 7,
    chara_karaka_mode: "none",
    dosha: [],
    element: "None",
    exalted_degree: 0.0,
    gender: "None",
    guna: "None",
    jyotish_num: 10,
    key: "ur",
    mula_trikon: [],
    name: "Uranus",
    nature: "None",
    opposition: "-",
    own_sign: [11],
    relations: {
      enemies: [],
      friends: [],
      neutral: [],
    },
  },
  {
    astro_num: 8,
    chara_karaka_mode: "none",
    dosha: [],
    element: "None",
    exalted_degree: 0.0,
    gender: "None",
    guna: "None",
    jyotish_num: 11,
    key: "ne",
    mula_trikon: [],
    name: "Neptune",
    nature: "None",
    opposition: "-",
    own_sign: [12],
    relations: {
      enemies: [],
      friends: [],
      neutral: [],
    },
  },
  {
    astro_num: 9,
    chara_karaka_mode: "none",
    dosha: [],
    element: "None",
    exalted_degree: 0.0,
    gender: "None",
    guna: "None",
    jyotish_num: 12,
    key: "pl",
    mula_trikon: [],
    name: "Pluto",
    nature: "None",
    opposition: "-",
    own_sign: [8],
    relations: {
      enemies: [],
      friends: [],
      neutral: [],
    },
  },
  {
    astro_num: 14,
    jyotish_num: 65535,
    key: "ea",
    name: "Earth",
    opposition: "-",
  },
  {
    astro_num: 10,
    jyotish_num: 65535,
    key: "mn",
    name: "MeanNode",
    opposition: "-",
  },
  {
    astro_num: 43,
    jyotish_num: 65535,
    key: "kr",
    name: "Kronos",
    opposition: "-",
  },
  {
    astro_num: 48,
    jyotish_num: 65535,
    key: "is",
    name: "Isis",
    opposition: "-",
  },
  {
    astro_num: 19,
    jyotish_num: 65535,
    key: "jn",
    name: "Juno",
    opposition: "-",
  },
  {
    astro_num: 17,
    jyotish_num: 65535,
    key: "ce",
    name: "Ceres",
    opposition: "-",
  },
  {
    astro_num: 15,
    jyotish_num: 65535,
    key: "ch",
    name: "Chiron",
    opposition: "-",
  },
  {
    astro_num: 24,
    jyotish_num: 65535,
    key: "sn",
    name: "SouthNode",
    opposition: "-",
  },
  {
    astro_num: -1,
    jyotish_num: -1,
    key: "as",
    name: "Ascendant",
    opposition: "-",
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
      jyotish_num: -1,
      key: "",
      name: "",
      opposition: "",
    };
  }
};

export const matchByJyNum = (num: number): GrahaAttrSet => {
  return matchByGrahaRef(num, (r: GrahaAttrSet) => r.jyotish_num === num);
};

export const matchNameJyNum = (num: number): string => {
  return matchByJyNum(num).name;
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
    key: "days",
    name: "Days",
    value: 1,
  },
  {
    key: "year",
    name: "Years",
    value: 365.25,
  },
];

export const matchUnitsBySection = (key = ""): KeyNumName[] => {
  switch (key) {
    case "extended":
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
  } /* 
  {
    key: "horizontal",
    name: "Horizontal",
    value: 2,
  }, */,
];

export const toEqInt = (key: string) => {
  switch (key) {
    case "equatorial":
      return 1;
    case "horizontal":
      return 2;
    default:
      return 0;
  }
};

export const toEqKey = (value = 0) => {
  switch (value) {
    case 1:
      return "equatorial";
    case 2:
      return "horizontal";
    default:
      return "ecliptic";
  }
};

export const toTopoKey = (topoMode = false) => {
  return topoMode ? "topocentric" : "geocentric";
};

export const showEqOptions = (key = ""): boolean => {
  switch (key) {
    case "extended":
      return true;
    default:
      return false;
  }
};
