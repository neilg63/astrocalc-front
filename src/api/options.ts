import { ParamSet } from "./interfaces";

export const astroOptions: ParamSet = {
  dt: "date_string",
  loc: "loc_string",
  bodies: "comma_string",
  topo: "int", // 0 = geocentric, 1 topocentric
  eq: "int", // 0 = ecliptic only, 1 equatorial only, 2 both ecliptic and equatorial, 3 both with altitude, azimuth and extra planetary phenomena such as magnitude and phase angle. The azimuth and altitude will only be shown in topocentric mode. 4 With extra planetary phenomena such as magnitude and phase angle as an inline subset.
  it: "int", // 1 = show indian time units with progress since the start of the current day period, 0 = do not show indian time units
  ph: "int", //  1 = show planetary phenomena for the referenced time unless it is shown inline with celestial body data, 0 = no extra phenomena unless eq == 4
  days: "int", // duration in days where applicable
  pd: "int", // number per day, 2 => every 12 hours
  dspan: "int", // number per days per calculation
  hsys: "comma_string", // Comma-separated list of house system letters or all for all systems, default W (whole house system)
  aya: "comma_string", // Comma-separated list of available ayanamshas (see below). These are added as separate data-set and should be applied in a post processing stage via simple subtraction from the lng, ascendant or rectAscension values, which are always tropical (they may automatically applied in /positions)
  retro: "int", // 1: show retrograde and peak stations of the main planets, 0: do not show planet stations
  p2: "int", // include progress synastry longitudes based on 1 day = 1 year from referenced time. Progress days since the historic chart data is mapped to years.
  p2yrs: "int", // Number of years to capture for P2 data
  p2ago: "int", // Number of years ago for the P2 start year
  p2start: "int", // Explcit start year for progress synastry data (alternative to above
  p2py: "int", // Number of p2 sample per year, default 2.
  p2bodies: "comma_string", // Bodies to captured for P2. These never include Uranus, Neptune, Pluto or asteroid. Narrow range to limit the payload
  daytime: "int", // 1 use daytime variants, 0 use night-time variants
  upa: "int", // 0 = false, 1 add upagraha periods including the sunAtRise if it IndianTime is also enabled
  jyo: "int", // 0 = false, 1 add special Jyotish degrees
  gre: "int", // 0 = false, 1 greek lots,
  num: "int", // integer number
  details: "int", // 0 don't show, 1 show
  d1: "float", // reference degree one
  d2: "float", // reference degree two
  orb: "float", // reference degree two
};
