import {
  camelToTitle,
  decPlaces6,
  smartCastFloat,
  smartCastInt,
  snakeToWords,
  subtractLng360,
  zeroPad,
} from "./converters";
import { matchUnitKeyByValue, toEqInt } from "./mappings";
import { isNumeric, notEmptyString } from "./utils";

export interface KeyNumValue {
  key: string;
  num?: number;
  value: number;
}

export interface KeyNumName {
  key: string;
  name: string;
  value: number;
}

export interface GeoCoords {
  lat: number;
  lng: number;
  alt?: number;
}

export class GeoLoc implements GeoCoords {
  lat = 0;

  lng = 0;

  alt = 0;

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      Object.entries(inData).forEach(([key, val]) => {
        if (isNumeric(val)) {
          const flVal = smartCastFloat(val);
          switch (key) {
            case "lat":
            case "latitude":
              this.lat = flVal;
              break;
            case "lng":
            case "long":
            case "longitude":
              this.lng = flVal;
              break;
            case "alt":
            case "altitude":
              this.alt = flVal;
              break;
          }
        }
      });
    }
  }

  toString(): string {
    const parts = [this.lat, this.lng];
    if (this.alt > 5 || this.alt < -5) {
      parts.push(Math.round(this.alt));
    }
    return parts.join(",");
  }
}

export const latLngToLocString = (lat = 0, lng = 0) => {
  return new GeoLoc({ lat, lng }).toString();
};

export interface UnixTimeRange {
  start: number;
  end?: number;
  hasEnd: boolean;
}

export class TimeZoneInfo {
  abbreviation = "";
  zoneName = "";
  utcOffset = 0;
  period: UnixTimeRange = { start: 0, end: 0, hasEnd: false };
  solarUtcOffset = 0;
  weekDay = 0; // 1 = Mon, 7 = Sun

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      let utcSet = false;
      Object.entries(inData).forEach(([key, val]) => {
        if (isNumeric(val)) {
          const flVal = smartCastFloat(val);
          switch (key) {
            case "utcOffset":
            case "gmtOffset":
              this.utcOffset = flVal;
              utcSet = true;
              break;
            case "solarUtcOffset":
              this.solarUtcOffset = flVal;
              break;
            case "weekDay":
              if (flVal >= 1 && flVal <= 7) {
                this.weekDay = Math.round(flVal);
              }
              break;
          }
        } else if (val instanceof Object) {
          const { start, end } = val as UnixTimeRange;
          if (typeof start === "number") {
            this.period.start = start;
          }
          if (typeof end === "number" && end > start) {
            this.period.end = end;
            this.period.hasEnd = true;
          }
        } else if (notEmptyString(val)) {
          switch (key) {
            case "abbreviation":
            case "abbr":
              this.abbreviation = val as string;
              break;
            case "zoneName":
            case "zone":
              this.zoneName = val as string;
              break;
          }
        }
      });
      if (utcSet && this.zoneName.length < 3) {
        const hourOffset = zeroPad(this.hours, 2);
        this.zoneName = ["Region", hourOffset].join("/");
        this.abbreviation = hourOffset;
      }
    }
  }

  get hours(): number {
    return this.utcOffset / 3600;
  }

  get minutes(): number {
    return Math.abs((this.utcOffset / 60) % 60);
  }

  get valid(): boolean {
    return notEmptyString(this.zoneName);
  }
}

export class TransitSet {
  key = "";
  prevSet = 0;
  prevRise = 0;
  rise = 0;
  mc = 0;
  set = 0;
  ic = 0;
  nextRise = 0;
  nextSet = 0;
  min = 0;
  max = 0;

  constructor(keyRef: any = null, items: KeyNumValue[] = []) {
    if (typeof keyRef === "string") {
      this.key = keyRef;
      for (const row of items) {
        switch (row.key) {
          case "prev_set":
          case "prevSet":
            this.prevSet = row.value;
            break;
          case "prev_rise":
          case "prevRise":
            this.prevRise = row.value;
            break;
          case "rise":
            this.rise = row.value;
            break;
          case "ic":
            this.ic = row.value;
            break;
          case "set":
            this.set = row.value;
            break;
          case "mc":
            this.mc = row.value;
            break;
          case "next_rise":
          case "nextRise":
            this.nextRise = row.value;
            break;
          case "next_set":
          case "nextSet":
            this.nextSet = row.value;
            break;
          case "min":
            this.min = row.value;
            break;
          case "max":
            this.max = row.value;
            break;
        }
      }
    } else if (keyRef instanceof Object) {
      Object.entries(keyRef).forEach(([key, value]) => {
        const dataType = typeof value;
        if (dataType === "string" && key === "key") {
          this.key = value as string;
        } else if (dataType === "number") {
          switch (key) {
            case "prevSet":
            case "prevRise":
            case "rise":
            case "mc":
            case "set":
            case "ic":
            case "nextRise":
            case "nextSet":
            case "min":
            case "max":
              this[key] = value as number;
              break;
          }
        }
      });
    }
  }

  get hasSet(): boolean {
    return this.set > 0;
  }

  get hasPrevSet(): boolean {
    return this.prevSet > 0;
  }

  get hasPrevRise(): boolean {
    return this.prevRise > 0;
  }

  get hasRise(): boolean {
    return this.rise > 0;
  }

  get hasNextRise(): boolean {
    return this.nextRise > 0;
  }

  get hasNextSet(): boolean {
    return this.nextSet > 0;
  }

  get hasMinMax(): boolean {
    return this.min !== 0 || this.max !== 0;
  }

  get next(): number {
    return this.hasNextRise ? this.nextRise : this.nextSet;
  }

  get prev(): number {
    return this.hasPrevSet ? this.prevSet : this.prevRise;
  }

  get showNext(): boolean {
    return !this.hasSet;
  }

  get showPrev(): boolean {
    return !this.hasRise;
  }

  get nextName(): string {
    return this.max < 0 ? "next set" : this.hasNextRise ? "next rise" : "";
  }

  get prevName(): string {
    return this.min > 0
      ? "previous rise"
      : this.hasPrevSet
      ? "previous set"
      : "";
  }

  get phase(): string {
    if (this.hasSet && this.hasRise) {
      return "daily";
    } else if (this.hasSet && !this.hasRise && this.min < 1) {
      return "up_ended";
    } else if (this.hasRise && !this.hasSet && this.max > -1) {
      return "down_ended";
    } else {
      return this.min >= 0 ? "up" : "down";
    }
  }
}

export class Variant {
  ayanamashaNum = -1;
  charaKaraka = -1;
  house = -1;
  jyNum = 1;
  key = "";
  lng = 0;
  nakshatra = -1;
  relationship = "";
  sign = 0;

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      Object.entries(inData).forEach(([key, val]) => {
        if (key === "key" && typeof val === "string") {
          this.key = val;
        }
        if (isNumeric(val)) {
          const flVal = smartCastFloat(val);
          switch (key) {
            case "ayanamashaNum":
            case "charaKaraka":
            case "house":
            case "jyNum":
            case "lng":
            case "nakshatra":
            case "sign":
              this[key] = flVal;
              break;
          }
        } else if (notEmptyString(val)) {
          switch (key) {
            case "key":
            case "relationship":
              this[key] = val as string;
              break;
          }
        }
      });
    }
  }

  get hasRelationship(): boolean {
    return (
      this.relationship.length > 2 && this.relationship.toLowerCase() !== "none"
    );
  }

  get hasCharaKaraka(): boolean {
    return this.charaKaraka > 0;
  }
}

const SphutaKeys = [
  "houseSign",
  "yogi",
  "avayogi",
  "yogiSphuta",
  "avayogiSphuta",
  "sriLagna",
  "induLagna",
  "ghatiLagna",
  "bhavaLagna",
  "horaLagna",
  "varnadaLagna",
  "bijaSphuta",
  "ksetraSphuta",
  "pranaSphuta",
  "dehaSphuta",
  "mrtuSphuta",
  "triSphuta",
  "catuSphuta",
  "pancaSphuta",
];

export class KeyNumericValue {
  key = "";
  value = 0;
  type = "deg";
  weight = 0;

  constructor(inData: any = null, index = 0, sortSphutas = false) {
    if (inData instanceof Object) {
      const { key, value } = inData;
      if (typeof value === "number") {
        this.value = value;
      }
      if (typeof key === "string") {
        this.key = key;
        switch (key.toLowerCase()) {
          case "yogi":
          case "avayogi":
          case "housesign":
          case "house_sign":
            this.type = "int";
            break;
          default:
            this.type = "deg";
            break;
        }
      }
      if (sortSphutas) {
        const keyPos = SphutaKeys.indexOf(this.key);
        const keyPosVal = keyPos < 0 ? 10000000 : keyPos * 10;
        this.weight = keyPosVal + index;
      } else {
        this.weight = index;
      }
    }
  }

  get name(): string {
    return snakeToWords(camelToTitle(this.key));
  }

  get isDeg(): boolean {
    return this.type.startsWith("deg");
  }

  get isInt(): boolean {
    return this.type.startsWith("int");
  }
}

export class SphutaSet {
  ayanamashaNum = -1;
  items: KeyNumericValue[] = [];

  constructor(inData: any = null, sortSphutas = false) {
    if (inData instanceof Object) {
      const { num, items, ayanamashaNum } = inData;
      if (typeof num === "number") {
        this.ayanamashaNum = num;
      } else if (typeof ayanamashaNum === "number") {
        this.ayanamashaNum = ayanamashaNum;
      }
      if (items instanceof Array) {
        this.items = items.map(
          (row, ri) => new KeyNumericValue(row, ri, sortSphutas)
        );
      }
      if (sortSphutas) {
        this.items.sort((a, b) => a.weight - b.weight);
      }
    }
  }
}

/*
 * Basic celestial object used with BodySet.
 * lng and lat may refer to right ascension, declination, azimuth and altitude depending on the body set topocentric equoatorial mode
 */
export class Body {
  key = "";
  lng = 0;
  lat = 0;
  latSpeed = 0;
  lngSpeed = 0;

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      Object.entries(inData).forEach(([key, val]) => {
        if (key === "key" && typeof val === "string") {
          this.key = val;
        }
        if (isNumeric(val)) {
          const flVal = smartCastFloat(val);
          switch (key) {
            case "lat":
            case "lng":
            case "latSpeed":
            case "lngSpeed":
              this[key] = flVal;
              break;
          }
        }
      });
    }
  }

  longitude(ayanamshaOffset = 0): number {
    return subtractLng360(this.lng, ayanamshaOffset);
  }

  get isPlanet(): boolean {
    return (
      ["as", "ds", "su"].includes(this.key) === false && this.key.length === 2
    );
  }

  get showLat(): boolean {
    return this.lat !== 0 || this.isPlanet;
  }

  get showLngSpeed(): boolean {
    return this.lngSpeed !== 0 || this.isPlanet;
  }

  get showLatSpeed(): boolean {
    return this.latSpeed !== 0 || this.isPlanet;
  }
}

export class BodySet {
  jd = 0;

  bodies: Body[] = [];

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      const { jd, bodies } = inData;
      if (bodies instanceof Array && bodies.length > 0) {
        this.bodies = bodies.map((row) => new Body(row));
      }
      if (typeof jd === "number" && jd > 0) {
        this.jd = jd;
      }
    }
  }
}

export class ProgressSet {
  jd = 0; // start JD

  days = 0;

  perUnit = 1;

  tz = new TimeZoneInfo(); // local time zone info at the referenced time and place

  ayanamsha = 0;

  ayanamshaKey = "";

  geo = new GeoLoc();

  placeNames = "";

  coordSystem = 0; // 0 ecliptic, 1 equatorial, 2 horizontal

  topoMode = false; // true: topocentric, false geocentric

  items: BodySet[] = [];

  private overrideAya = false;

  constructor(inData: any = null, tz: any = null, placeString = "") {
    if (tz instanceof Object) {
      this.tz = new TimeZoneInfo(tz);
    }
    if (notEmptyString(placeString)) {
      this.placeNames = placeString;
    }
    if (inData instanceof Object) {
      const keys = Object.keys(inData);
      const restoreMode = keys.includes("jd") && keys.includes("ayanamsha");
      const { items, days, geo, perUnit } = inData;

      if (items instanceof Array && items.length > 0) {
        this.items = items.map((row) => new BodySet(row));
      }
      if (isNumeric(days)) {
        this.days = smartCastInt(days, 1);
      }
      if (isNumeric(perUnit)) {
        this.perUnit = smartCastInt(perUnit, 1);
      }

      if (geo instanceof Object) {
        this.geo = new GeoLoc(geo);
      }
      if (restoreMode) {
        const {
          jd,
          tz,
          coordSystem,
          topoMode,
          ayanamsha,
          ayanamshaKey,
          placeNames,
        } = inData;
        this.topoMode = topoMode === true;
        if (isNumeric(jd)) {
          this.jd = smartCastInt(jd, 0);
        }
        if (isNumeric(ayanamsha)) {
          this.ayanamsha = smartCastFloat(ayanamsha, 0);
        }
        if (notEmptyString(ayanamshaKey)) {
          this.ayanamshaKey = ayanamshaKey;
        }
        if (tz instanceof Object) {
          this.tz = new TimeZoneInfo(tz);
        }
        if (notEmptyString(placeNames)) {
          this.placeNames = placeNames;
        }
        if (isNumeric(coordSystem)) {
          this.coordSystem = smartCastInt(coordSystem);
        }
      } else {
        const { date, coordinateSystem, ayanamshas } = inData;

        if (date instanceof Object) {
          const { jd } = date;
          if (isNumeric(jd)) {
            this.jd = smartCastInt(jd, 0);
          }
        }
        if (ayanamshas instanceof Array && ayanamshas.length > 0) {
          if (ayanamshas[0] instanceof Object) {
            const { value, key } = ayanamshas[0];
            if (isNumeric(value)) {
              this.ayanamsha = smartCastFloat(value);
            }
            if (notEmptyString(key)) {
              this.ayanamshaKey = key;
            }
          }
        }
        if (notEmptyString(coordinateSystem)) {
          const parts = coordinateSystem.toLowerCase().split("/");
          if (parts.length > 1) {
            this.coordSystem = toEqInt(parts[0]);
            this.topoMode = parts[1].includes("topo");
          }
        }
      }
    }
  }
  get hasData(): boolean {
    if (this.items.length > 0) {
      if (this.items[0].bodies.length > 0) {
        return true;
      }
    }
    return false;
  }

  get bodyKeys(): string[] {
    if (this.items.length > 0) {
      if (this.items[0].bodies.length > 0) {
        return this.items[0].bodies.map((b) => b.key);
      }
    }
    return [];
  }

  get numRows(): number {
    return this.items.length;
  }

  get perDay(): number {
    const num = this.numRows;
    return num > 0 && this.days > 0 ? Math.round(num / this.days) : 0;
  }

  get unitSpan(): number {
    return (this.days / this.numRows) * this.perUnit;
  }

  get numUnits(): number {
    return this.numRows / this.perUnit;
  }

  get unit(): string {
    return matchUnitKeyByValue(this.unitSpan);
  }

  get multiple(): number {
    const num = this.numRows;
    return num > 0 && this.days > 0 ? Math.round(this.days / num) : 0;
  }

  get hasAyanamsha(): boolean {
    return this.ayanamsha > 0 && this.coordSystem < 1;
  }

  get ayaApplied(): boolean {
    return this.hasAyanamsha && !this.overrideAya;
  }

  get tropicalOffset(): number {
    if (this.hasAyanamsha) {
      return 0 - this.ayanamsha;
    } else {
      return 0;
    }
  }

  get contextualOffset(): number {
    return this.ayaApplied ? 0 : this.hasAyanamsha ? 0 - this.ayanamsha : 0;
  }

  applyOverride(newState = true) {
    this.overrideAya = newState === true;
  }

  get appliedAyanamshaLabel(): string {
    return this.ayaApplied
      ? [snakeToWords(this.ayanamshaKey), decPlaces6(this.ayanamsha)].join(
          " ➡︎ "
        )
      : "tropical";
  }
}

/*
 * Embellished Body class with core attributed implemented in Body above
 */
export class Graha extends Body {
  lngTopo = -1;
  latTopo = 0;
  latSpeedEq = 0;
  lngSpeedEq = 0;
  rectAscension = 0;
  declination = 0;
  altitude = 0;
  azimuth = 0;
  variants: Variant[] = [];

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      super(inData);
      Object.entries(inData).forEach(([key, val]) => {
        if (isNumeric(val)) {
          const flVal = smartCastFloat(val);
          switch (key) {
            case "latTopo":
            case "lngTopo":
            case "latSpeedEq":
            case "lngSpeedEq":
            case "declination":
            case "rectAscension":
            case "altitude":
            case "azimuth":
              this[key] = flVal;
              break;
          }
        }
        if (key === "variants" && val instanceof Array) {
          val.forEach((row) => {
            this.addVariant(row);
          });
        }
      });
    }
  }

  addVariant(inData: any = null) {
    if (inData instanceof Object) {
      this.variants.push(new Variant(inData));
    }
  }

  setTopo(lng = -1, lat = 0) {
    if (lng >= 0) {
      this.lngTopo = lng;
      this.latTopo = lat;
    }
  }

  get hasTopo() {
    return this.lngTopo >= 0;
  }

  get hasVariants(): boolean {
    return this.variants.length > 0;
  }

  get firstVariant(): Variant {
    if (this.hasVariants) {
      return this.variants[0];
    } else {
      return new Variant();
    }
  }
}

export class ITime {
  dayBefore = true;
  isDayTime = true;
  dayLength = 0;
  progress = 0;
  dayNum = 0;
  ghati = 0;
  lipta = 0;
  muhurta = 0;
  vighati = 0;
  weekDayNum = 0;
  year = 0;

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      Object.entries(inData).forEach(([key, val]) => {
        switch (key) {
          case "dayBefore":
          case "isDayTime":
            this[key] = val === true;
            break;
        }
        if (isNumeric(val)) {
          const flVal = smartCastFloat(val);
          switch (key) {
            case "dayLength":
            case "year":
            case "progress":
            case "dayNum":
            case "ghati":
            case "vighati":
            case "lipta":
            case "muhurta":
            case "weekDayNum":
              this[key] = flVal;
              break;
          }
        }
      });
    }
  }

  get period(): string {
    return this.isDayTime ? "daytime" : "night-time";
  }

  get dayLengthSeconds(): number {
    return this.dayLength * 24 * 60 * 60;
  }
}

export class PointSet {
  armc = 0;
  ascAzi = 0;
  ascDec = 0;
  ascRa = 0;
  ascendant = 0;
  coasc1 = 0;
  coasc2 = 0;
  equasc = 0;
  mc = 0;
  mcAlt = 0;
  mcAzi = 0;
  mcDec = 0;
  mcRa = 0;
  polasc = 0;
  vertex = 0;

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      Object.entries(inData).forEach(([key, val]) => {
        if (isNumeric(val)) {
          const flVal = smartCastFloat(val);
          switch (key) {
            case "armc":
            case "ascAzi":
            case "ascDec":
            case "ascRa":
            case "ascendant":
            case "coasc1":
            case "coasc2":
            case "equasc":
            case "mcAlt":
            case "mcAzi":
            case "mcDec":
            case "mcRa":
            case "polasc":
            case "vertex":
              this[key] = flVal;
              break;
          }
        }
      });
    }
  }

  get hasMcAzi(): boolean {
    return this.mcAzi !== 0;
  }
}

export class HouseSet {
  houses: number[] = [];
  system = "W";

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      const { houses, system } = inData;
      if (houses instanceof Array) {
        this.houses = houses;
      }
      if (typeof system === "string") {
        this.system = system;
      }
    }
  }
}

export class AstroChart {
  jd = 0;

  tz = new TimeZoneInfo(); // local time zone info at the referenced time and place

  ayanamshas: KeyNumValue[] = [];

  geo = new GeoLoc();

  placeName = "";

  points: PointSet = new PointSet(); // core astronomical points

  bodies: Graha[] = []; // array of celestial bodies
  hsets: HouseSet[] = [];
  indianTime = new ITime();
  transits: TransitSet[] = [];
  sphutas: SphutaSet[] = [];
  upagrahas: SphutaSet[] = [];
  private ascendantVariants: Variant[] = [];

  constructor(inData: any = null, tz: any = null, placeNameString = "") {
    if (inData instanceof Object) {
      const keys = Object.keys(inData);
      const restoreMode = keys.includes("hsets") && keys.includes("placeName");
      const {
        bodies,
        geo,
        indianTime,
        ayanamshas,
        transits,
        variants,
        sphutas,
        upagrahas,
      } = inData;

      if (bodies instanceof Array) {
        this.bodies = bodies.map((b) => new Graha(b));
      }

      if (restoreMode) {
        const { hsets, points, placeName, jd, tz, ascendantVariants } = inData;
        if (hsets instanceof Array) {
          this.hsets = hsets.map((hs) => new HouseSet(hs));
        }
        if (points instanceof Object) {
          this.points = new PointSet(points);
        }
        if (notEmptyString(placeName)) {
          this.placeName = placeName;
        }
        if (jd > 0) {
          this.jd = jd;
        }
        if (tz instanceof Object) {
          this.tz = new TimeZoneInfo(tz);
        }
        if (ascendantVariants instanceof Array) {
          this.ascendantVariants = ascendantVariants.map(
            (row) => new Variant(row)
          );
        }
      } else {
        const { house, date, variantHouses, topoVariants } = inData;
        if (house instanceof Object) {
          const { points, sets } = house;
          this.points = new PointSet(points);
          const hSets =
            variantHouses instanceof Object &&
            Object.keys(variantHouses).includes("values") &&
            variantHouses.values instanceof Array
              ? [{ ...sets[0], houses: variantHouses.values }]
              : sets;
          if (hSets instanceof Array) {
            this.hsets = hSets.map((hset: any) => new HouseSet(hset));
          }
        }
        if (date instanceof Object) {
          const { jd } = date;
          if (typeof jd === "number") {
            this.jd = jd;
          }
        }
        if (tz instanceof Object) {
          this.tz = new TimeZoneInfo(tz);
        } else if (typeof tz === "number") {
          this.tz = new TimeZoneInfo({ gmtOffset: tz });
        }
        if (notEmptyString(placeNameString)) {
          this.placeName = placeNameString;
        }
        if (topoVariants instanceof Array && topoVariants.length > 0) {
          topoVariants.forEach((row) => {
            if (row instanceof Object) {
              const { key, lng, lat } = row;
              const gr = this.bodies.find((b) => b.key === key);
              if (gr instanceof Graha) {
                gr.setTopo(lng, lat);
              }
            }
          });
        }
      }

      if (geo instanceof Object) {
        this.geo = new GeoLoc(geo);
      }
      if (indianTime instanceof Object) {
        this.indianTime = new ITime(indianTime);
      }
      if (ayanamshas instanceof Array) {
        this.ayanamshas = ayanamshas
          .filter((row) => row instanceof Object)
          .map((row) => row as KeyNumValue);
      }
      if (transits instanceof Array) {
        for (const row of transits) {
          if (row instanceof Object) {
            if (restoreMode) {
              this.transits.push(new TransitSet(row));
            } else {
              const { key, items } = row;
              if (items instanceof Array) {
                this.transits.push(new TransitSet(key, items));
              }
            }
          }
        }
        if (variants instanceof Array) {
          for (const row of variants) {
            if (row instanceof Object) {
              this.addVariant(row);
            }
          }
        }
        if (sphutas instanceof Array) {
          for (const row of sphutas) {
            if (row instanceof Object) {
              this.sphutas.push(new SphutaSet(row, true));
            }
          }
        }
        if (upagrahas instanceof Array) {
          for (const row of upagrahas) {
            if (row instanceof Object) {
              this.upagrahas.push(new SphutaSet(row));
            }
          }
        }
      }
    }
  }

  addVariant(inData: any = null) {
    const { key } = inData;
    if (notEmptyString(key)) {
      const body = this.bodies.find((b) => b.key === key);
      if (body instanceof Graha) {
        body?.addVariant(inData);
      } else if (key === "as") {
        this.ascendantVariants.push(new Variant(inData));
      }
    }
  }

  get tzOffsetSeconds(): number {
    return this.tz.utcOffset;
  }

  get tzOffsetMinutes(): number {
    return this.tzOffsetMinutes / 60;
  }
  get tzOffsetHours(): number {
    return this.tzOffsetMinutes / 3600;
  }

  get hasVariants(): boolean {
    return this.bodies.some((b) => b.hasVariants);
  }

  get numVariants(): number {
    const item = this.bodies.find((b) => b.hasVariants);
    if (item instanceof Graha) {
      return item.variants.length;
    } else {
      return 0;
    }
  }

  get grahas(): Graha[] {
    return [this.ascendant, ...this.bodies];
  }

  get ascendant(): Graha {
    const graha = new Graha({
      key: "as",
      lng: this.points.ascendant,
      lngSpeed: 0,
      lat: 0,
      latSpeed: 0,
      azimuth: this.points.ascAzi,
      altitude: 0,
      rectAscension: this.points.ascRa,
      declination: this.points.ascDec,
    });
    for (const variant of this.ascendantVariants) {
      graha.addVariant(variant);
    }
    return graha;
  }

  get hasPlaceName(): boolean {
    return notEmptyString(this.placeName);
  }

  getAyanamsha(keyRef: string | number): number {
    const row = this.ayanamshas.find(
      (r) => r.key === keyRef || r.num === keyRef
    );
    if (row instanceof Object) {
      return row.value;
    } else {
      return 0;
    }
  }

  get ayanamsha(): number {
    return this.getAyanamsha(this.ayanamshaKey);
  }

  get ayanamshaKey(): string {
    if (this.ayanamshas.length > 0) {
      return this.ayanamshas[0].key;
    } else {
      return "tropical";
    }
  }

  get hasSphutas(): boolean {
    return this.sphutas.length > 0;
  }

  get hasUpagrahas(): boolean {
    return this.upagrahas.length > 0;
  }
}

export class GeoName {
  name = "";
  lat = 0;
  lng = 0;

  constructor(inData: any = null) {
    if (inData instanceof Object) {
      Object.entries(inData).forEach(([key, val]) => {
        if (isNumeric(val)) {
          const flVal = smartCastFloat(val);
          switch (key) {
            case "lat":
              this.lat = flVal;
              break;
            case "lng":
              this.lng = flVal;
              break;
          }
        }
        if (notEmptyString(val)) {
          const sVal = val as string;
          switch (key) {
            case "text":
            case "name":
              this.name = sVal;
              break;
          }
        }
      });
    }
  }

  get placeName(): string {
    return this.name;
  }

  get coords(): string {
    return [this.lat, this.lng].join(",");
  }
}

export class TransitItem {
  key = "";
  jd = 0;
  altitude = 0;

  constructor(key = "", jd = 0, altitude = 0) {
    if (notEmptyString(key)) {
      this.key = key;
    }
    if (isNumeric(jd)) {
      this.jd = smartCastFloat(jd);
    }
    if (isNumeric(altitude) && ["set", "rise"].includes(this.key) === false) {
      this.altitude = smartCastFloat(altitude);
    }
  }

  get valid() {
    return this.jd > 1000 && this.key.length > 1;
  }

  get hasAltitude() {
    return (
      this.jd > 1000 && this.key.length > 1 && ["mc", "ic"].includes(this.key)
    );
  }
}

const buildTransitItems = (items: any[] = [], restoreMode = false) => {
  let newItems: TransitItem[] = [];
  if (restoreMode) {
    newItems = items
      .filter((item) => item instanceof Object)
      .map((row) => {
        const { key, jd, altitude } = row;
        return new TransitItem(key, jd, altitude);
      });
  } else {
    const numItems = items.length;
    if (numItems > 3) {
      let currentMinIndex = -1;
      let currentMaxIndex = -1;
      let minVal = 0;
      let maxVal = 0;
      for (let i = 0; i < numItems; i++) {
        const row = items[i];
        if (row instanceof Object) {
          const { key, value } = row;
          switch (key) {
            case "min":
              minVal = value;
              break;
            case "max":
              maxVal = value;
              break;
            case "ic":
            case "mc":
              if (key === "ic") {
                currentMinIndex = newItems.length;
              } else {
                currentMaxIndex = newItems.length;
              }
              newItems.push(new TransitItem(key, value));
              break;
            case "rise":
            case "set":
              newItems.push(new TransitItem(key, value));
              break;
          }
          if (currentMinIndex >= 0 && minVal !== 0) {
            if (newItems[currentMinIndex] instanceof TransitItem) {
              newItems[currentMinIndex].altitude = minVal;
              currentMinIndex = -1;
              minVal = 0;
            }
          }
          if (currentMaxIndex >= 0 && maxVal !== 0) {
            if (newItems[currentMaxIndex] instanceof TransitItem) {
              newItems[currentMaxIndex].altitude = maxVal;
              currentMaxIndex = -1;
              maxVal = 0;
            }
          }
        }
      }
    }
  }
  newItems.sort((a, b) => a.jd - b.jd);
  return newItems;
};

export class TransitListSet {
  key = "";
  items: TransitItem[] = [];

  constructor(inData: any = null, restoreMode = false) {
    if (inData instanceof Object) {
      const { key, items } = inData;
      const refItems = items instanceof Array ? items : [];
      if (refItems.length > 0) {
        this.items = buildTransitItems(refItems, restoreMode);
      }
      if (notEmptyString(key)) {
        this.key = key;
      }
    }
  }
}

export class SunTransitList {
  key = "su";

  jd = 0;

  geo = new GeoLoc();

  placeName = "";

  tz = new TimeZoneInfo();

  days = 0;

  items: TransitSet[] = [];

  constructor(
    inData: any = null,
    newTz = new TimeZoneInfo(),
    placeString = "",
    numDays = 0
  ) {
    const isObj = inData instanceof Object;
    const keys = isObj ? Object.keys(inData) : [];
    const restoreMode = keys.includes("days") && keys.includes("jd");
    if (isObj) {
      const { key, geo } = inData;
      if (notEmptyString(key)) {
        this.key = key;
      }
      if (geo instanceof Object) {
        const { jd } = inData;
        this.geo = new GeoLoc(geo);
      }
      if (restoreMode) {
        const { jd, days, tz, placeName, items } = inData;
        if (isNumeric(jd)) {
          this.jd = smartCastFloat(jd);
        }
        if (isNumeric(days)) {
          this.days = smartCastInt(days);
        }
        if (tz instanceof Object) {
          this.tz = new TimeZoneInfo(tz);
        }
        if (notEmptyString(placeName)) {
          this.placeName = placeName;
        }
        if (items instanceof Array) {
          this.items = items.map(
            (row) => new TransitSet({ key: "su", ...row })
          );
        }
      } else {
        const { date, sunTransitions } = inData;
        if (date instanceof Object) {
          const { jd } = inData;
          if (isNumeric(jd)) {
            this.jd = smartCastFloat(jd);
          }
        }
        if (newTz instanceof Object) {
          this.tz = new TimeZoneInfo(newTz);
        }
        if (numDays) {
          this.days = smartCastInt(numDays, 1);
        }
        if (notEmptyString(placeString)) {
          this.placeName = placeString;
        }
        if (sunTransitions instanceof Array) {
          this.items = sunTransitions.map(
            (row) => new TransitSet({ key: "su", ...row })
          );
        }
      }
    }
  }

  get keys(): string[] {
    return ["prev", "rise", "mc", "max", "set", "ic", "min", "next"];
  }
}

export class TransitList {
  jd = 0;

  geo = new GeoLoc();

  tz = new TimeZoneInfo();

  days = 0;

  transitSets: TransitListSet[] = [];

  placeName = "";

  constructor(
    inData: any = null,
    newTz = new TimeZoneInfo(),
    placeNameString = "",
    numDays = 0
  ) {
    if (inData instanceof Object) {
      const keys = Object.keys(inData);
      const restoreMode = keys.includes("tz") && keys.includes("placeName");
      if (restoreMode) {
        const { jd, tz, placeName, days } = inData;
        if (tz instanceof Object) {
          this.tz = new TimeZoneInfo(tz);
        }
        if (notEmptyString(placeName)) {
          this.placeName = placeName;
        }
        if (isNumeric(jd)) {
          this.jd = smartCastFloat(jd);
        }
        if (isNumeric(days)) {
          this.days = smartCastInt(days);
        }
      } else {
        const { date } = inData;
        if (date instanceof Object) {
          const { jd } = date;
          this.jd = smartCastFloat(jd);
        }
      }
      if (numDays > 0) {
        this.days = smartCastInt(numDays);
      }
      const { geo, transitionSets } = inData;
      if (newTz instanceof Object) {
        this.tz = new TimeZoneInfo(newTz);
      }
      if (notEmptyString(placeNameString)) {
        this.placeName = placeNameString;
      }
      if (transitionSets instanceof Array) {
        this.transitSets = transitionSets.map(
          (tSet) => new TransitListSet(tSet, restoreMode)
        );
      }
      if (geo instanceof Object) {
        this.geo = new GeoLoc(geo);
      }
    }
  }

  get keyMap(): Map<string, number> {
    const mp: Map<string, number> = new Map();
    this.transitSets.forEach((tSet) => {
      mp.set(tSet.key, tSet.items.length);
    });
    return mp;
  }

  get keys() {
    return this.transitSets.map((tSet) => tSet.key);
  }

  rows() {
    const rows: TransitItem[][] = [];
    const keys = this.keys;
    const keyMap = this.keyMap;
    const maxLen = Math.max(...keyMap.values());
    const emptyRow = keys.map((key) => new TransitItem(key, 0));

    for (let index = 0; index < maxLen; index++) {
      rows.push([...emptyRow]);
      keys.forEach((key, keyIndex) => {
        const tSet = this.transitSets[keyIndex];
        if (tSet instanceof TransitListSet) {
          if (keyMap.has(key)) {
            const num = keyMap.get(key);
            if (typeof num === "number" && index < num) {
              const currItem = this.transitSets[keyIndex].items[index];
              if (currItem instanceof TransitItem) {
                rows[index][keyIndex] = currItem;
              }
            }
          }
        }
      });
    }
    return rows;
  }
}
