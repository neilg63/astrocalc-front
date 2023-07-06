import { For, Show, createEffect, createSignal } from "solid-js";
import { fetchChartData, fetchTz } from "~/api/fetch";
import { formatDate, notEmptyString, yearsAgoDateString } from "~/api/utils";
import { updateInputValue } from "~/api/forms";
import { decDegToDms, decPlaces4, degAsLatStr, degAsLngStr, extractPlaceString, hrsMinsToString, smartCastInt } from "~/api/converters";
import { fetchGeo, getGeoTzOffset } from "~/api/geoloc-utils";
import { AstroChart, GeoLoc, GeoName, TimeZoneInfo, latLngToLocString } from "~/api/models";
import { currentJulianDate, dateStringToJulianDate, julToDateParts, localDateStringToJulianDate } from "~/api/julian-date";
import ChartData from "./ChartaData";
import { fromLocal, toLocal } from "~/lib/localstore";
import AyanamashaSelect from "./AyanamshaSelect";
import OptionSelect from "./OptionSelect";
import { houseSystems } from "~/api/mappings";
import { Button, Checkbox, Icon, IconButton } from "@suid/material";
import DmsInput from "./DmsInput";
import PlaceNameSelector from "./PlaceNameSelector";
import Tooltip from "./Tooltip";


interface LocDt {
  dt: string;
  loc: string;
  jd?: number;
}

interface LocalDateTimeParts {
  dateTime: string;
  timeZone: string;
  periodName?: string;
}

const buildDateTimeStrings = (): LocalDateTimeParts => {
  const dateParts = new Date().toString().split(" ");
  const timeIndex = dateParts.findIndex(part => /^\d\d?:\d\d?:\d\d$/.test(part));
  const dtParts = dateParts.slice(0, timeIndex + 1);
  const tzParts = dateParts.slice(timeIndex + 1);
  const timeZoneExtended = tzParts.join(' ').replace(/GMT/, 'UTC').replace(/(\d\d)(\d\d)/, "$1h $2m").replace(/0(\d)h/, "$1h").replace(/\b00?m/, "");
  const parts = timeZoneExtended?.split('(');
  const numParts = parts instanceof Array ? parts.length : 0;
  const timeZone = numParts > 0 ? parts[0].trim() : '';
  const periodName = numParts > 1 ? parts[1].replace(')','').trim() : '';
  return { dateTime: dtParts.join(' '), timeZone, periodName }
}

export default function ControlPanel() {
  const [dateString, setDateString] = createSignal(yearsAgoDateString(30));
  const [timeString, setTimeString] = createSignal('12:00');
  const [offsetHrs, setOffsetHrs] = createSignal(0);
  const [offsetMins, setOffsetMins] = createSignal(0);
  const [tz, setTz] = createSignal(new TimeZoneInfo());
  const [placeString, setPlaceString] = createSignal('');
  const [defLat, setDefLat] = createSignal(0);
  const [defLng, setDefLng] = createSignal(0);
  const [init, setInit] = createSignal(false);
  const [lat, setLat] = createSignal(0)
  const [lng, setLng] = createSignal(0);
  const [tzOffset, setTzOffset] = createSignal(0);
  const [applyAya, setApplyAya] = createSignal(true);
  const [ayaKey, setAyaKey] = createSignal("tc");
  const [hsys, setHsys] = createSignal("W");
  const { dateTime, timeZone } = buildDateTimeStrings();
  const [currDateString, setCurrDateString] = createSignal(dateTime)
  const [currTimeZone, setCurrTimeZone] = createSignal(timeZone);
  const [localPlaceName, setLocalPlaceName] = createSignal('N/A')
  const [localZoneAbbr, setLocalZoneAbbr] = createSignal('')
  
  // const [json, setJson] = createSignal('')
  
  const [chart, setChart] = createSignal(new AstroChart());
  const [showData, setShowData] = createSignal(false);

  const extractDtLoc = (): LocDt => {
    const dt = [dateString(), timeString()].join('T');
    const loc = latLngToLocString(lat(), lng());
    const { jd } = localDateStringToJulianDate(dt, tzOffset());
    return { dt, jd, loc };
  }

  const utcDateString = () => {
    const dt = [dateString(), timeString()].join('T');
    return dateStringToJulianDate(dt, 0 - tzOffset()).toISOSimple();
  }

  const fetchChart = () => {
    const { loc, jd } = extractDtLoc();
    setShowData(false);
    fetchChartData({ ct: 1, jd, loc, it: 1, aya: ayaKey(), upa: 1, jyo: 1, hsys: hsys() }).then((data: any) => {
      if (data instanceof Object && data.date.jd > 0) {
        const chart = new AstroChart(data, tz(), placeString());
        setChart(chart);
        // setJson(str)
        setShowData(true);
        toLocal("current-chart", chart);
      }
    });
  }
  const opneChart = () => setShowData(true);
  const updateDate = (e: Event) => updateInputValue(e, setDateString, '\\d\\d\\d\\d-[012][0-9]-[0123][0-9]');
  const updateTime = (e: Event) => updateInputValue(e, setTimeString,'[012][0-9]:[0-5][0-9](:[0-5][0-9])?');
  const updateOffset = (e: Event, minuteMode = false) => {
    let hrs = offsetHrs();
    let mins = offsetMins();
    updateInputValue(e, (val: string) => {
       const newVal = smartCastInt(val, 0);
       if (minuteMode) {
         mins = newVal;
         setOffsetMins(newVal);
       } else {
         hrs = newVal;
         setOffsetHrs(newVal);
       }
    });
    const secs = hrs * 3600 + mins * 60;
    setTzOffset(secs);
  }

  const updateTimeOffset = (secsOffset: number) => {
    const mins = Math.round(secsOffset / 60) % 60;
    const hrs = Math.floor(secsOffset / 3600);
    setOffsetHrs(hrs);
    setOffsetMins(mins);
    setTzOffset(secsOffset);
  }

  const updateGeoTz = (addPlaceNames = false) => {
    const { loc, dt } = extractDtLoc();
    const addPn = addPlaceNames === true;
    fetchTz(dt, loc, addPn).then((data) => {
      if (data instanceof Object) {
        const keys = Object.keys(data);
        const tz = (keys.includes("time") && data.time instanceof Object) ? data.time : data;
        if (typeof tz.gmtOffset === "number") {
          updateTimeOffset(tz.gmtOffset);
          setTz(new TimeZoneInfo(tz));
          toLocal("current-tz", tz);
        }
        if (addPn && keys.includes("placenames")) {
          if (data.placenames instanceof Array) {
            const plStr = extractPlaceString(data.placenames);
            setPlaceString(plStr);
          }
        }
      }
    })
  }

  const updatePlaceName = ({ name, hasGeo, lat, lng }: { name: string; hasGeo: boolean; lat: number; lng: number }) => {
    if (hasGeo) {
      toLocal('geoname', { name, lat, lng });
      setLng(lng);
      setLat(lat);
      setTimeout(updateGeoTz, 500);
      setPlaceString(name);
    }
  }

  const updateApplyAya = () => {
    setShowData(false);
    setApplyAya(!applyAya());
    setTimeout(() => {
      setShowData(true);
    }, 250)
  }

  const syncLatLng = (lat: number, lng: number) => {
    setLat(lat);
    setLng(lng);
  }

  const selectListOption = (e: Event, func: Function) => {
    if (e.target instanceof HTMLSelectElement) {
      func(e.target.value);
    }
  }

  const selectAyaOpt = (e: Event) => selectListOption(e, setAyaKey);

  // const selectHsys = (e: Event) => selectListOption(e, setHsys);

  const syncLocalGeo = (checkInitialised = false) => {
    fetchGeo((data: any) => {
      if (data instanceof Object) {
        const { latitude, longitude } = data;
        if (typeof latitude === "number") {
          const proceed = !checkInitialised || (!init() && lat() === 0 && lng() === 0)
          setDefLat(latitude);
          setDefLng(longitude);
          if (proceed) {
            syncLatLng(latitude, longitude);
            toLocal("current-geo", new GeoLoc({ lat: latitude, lng: longitude }));
          }
          const dtStr = new Date().toISOString().split('.').shift();
          const locStr = latLngToLocString(latitude, longitude);
          fetchTz(dtStr as string, locStr, true).then(result => {
            const { time, placenames } = result;
            if (placenames instanceof Array) {
              const plStr = extractPlaceString(placenames);
              setLocalPlaceName(plStr);
              const hasPlace = notEmptyString(placeString());
              if (!hasPlace && defLat() === lat()) {
                setPlaceString(plStr);
              }
            }
            if (time instanceof Object) {
              const { abbreviation } = time;
              setLocalZoneAbbr(abbreviation);
            }
          })
        }
      }
    })
  }

  const resetGeo = () => {
    syncLocalGeo(false);
    setTimeout(() => { 
      updateGeoTz(true);
    }, 375);
  }

  const resetTime = () => {
    const jdObj = currentJulianDate();
    const parts = jdObj.toISOSimple().split("T");
    setDateString(parts[0]);
    setTimeString(parts[1]);
    setTimeout(() => {
      updateGeoTz(false)
    }, 250);
  }

  const geoResetLabel = (lat: number, lng: number):string => {
    const lbls = [`Reset to your current location`];
    if (lat !== 0 && lng !== 0 && lng !== undefined) {
      lbls.push([degAsLatStr(lat), degAsLngStr(lng)].join(', '))
    }
    return lbls.join(": ");
  }

  createEffect(() => {
    syncLocalGeo(true);
    if (!init()) {
      const secsOffset = getGeoTzOffset();
      updateTimeOffset(secsOffset);
      const cData = fromLocal("current-chart", 7 * 24 * 3600);
      const geoData = fromLocal("geoname", 7 * 24 * 3600);
      const tzData = fromLocal("current-tz", 24 * 3600);
      
      let chartData = cData.valid ? cData.data : null;
      const hasData = chartData instanceof Object;
      const tzObj = tzData.valid ? tzData.data : null;
      let tzInfo = new TimeZoneInfo(tzObj);
      if (tzInfo.valid) {
        const hrs = tzInfo.hours < 0 ? Math.ceil(tzInfo.hours) : Math.floor(tzInfo.hours);
        setOffsetHrs(hrs)
        setOffsetMins(tzInfo.minutes);
        setTzOffset(tzInfo.utcOffset);
        setTz(tzInfo);
      }
      if (geoData.valid) {
        const { lat, lng, name } = geoData.data;
        if (notEmptyString(name)) {
          if (!hasData) {
            syncLatLng(lat, lng);
          }
          setPlaceString(name);
        }
      }
      if (hasData) {
        const chart = new AstroChart(chartData);
        setChart(chart);
        syncLatLng(chart.geo.lat, chart.geo.lng);
        setTimeout(opneChart, 500);
        const dateObj = julToDateParts(chart.jd, tz().utcOffset);
        const ps = dateObj.toISOSimple().split('T');
        setDateString(ps[0]);
        setTimeString(ps[1]);
        if (chart.hasPlaceName) {
          setPlaceString(chart.placeName);
        }
      }

      setTimeout(() => {
        setInit(true)
        if (defLng() === 0 && defLat() === 0) {
          const cGeoData = fromLocal("current-geo");
          if (cGeoData.data instanceof Object) {
            const { lat, lng } = cGeoData.data;
            if (typeof lat === "number") {
              setDefLat(lat);
              setDefLng(lng);
            }
          }
        }
      }, 500);
      setInterval(() => {
        const { dateTime, timeZone } = buildDateTimeStrings();
        setCurrDateString(dateTime)
        setCurrTimeZone(timeZone);
      }, 1000);
    }
  })

  return (
    <>
      

    <aside class="status-info flex column">
        <div class="current-location flex row">
          <span class="latitude">{degAsLatStr(defLat())}</span>
          <span class="latitude">{ degAsLngStr(defLng())}</span>
        </div>
        <div class="placename">{localPlaceName()}</div>
        <div class="flex column">
          <time class="date-time">{currDateString()}</time>
          <div class="date-time">
            <span class="tz-offset">{currTimeZone()}</span>
            <em class="abbreviation">{ localZoneAbbr() }</em>
          </div>
      </div>
    </aside>
      <fieldset class="top-controls grid top-grid" >
        <div class="date-time-bar flex flex-row">
          <input type="date" value={dateString()} size="12" onChange={(e) => updateDate(e)} />
          <input type="time" value={timeString()} size="12" onChange={(e) => updateTime(e)} />
          <div class="tz-offset-control">
            <input type="number" class="hours" value={offsetHrs()} size="1" onChange={(e) => updateOffset(e, false)} step="1" min="-15" max="15" />
            <input type="number" class="minutes" value={offsetMins()} size="1" onChange={(e) => updateOffset(e, true)} step="1" min="0" max="59" />
          </div>
          <Tooltip label="Set to current date and time">
            <IconButton aria-label="set-to-current" color="primary" onClick={resetTime}>
            <Icon>today</Icon>
          </IconButton>
          </Tooltip>
          <AyanamashaSelect value={ayaKey()} onSelect={(e: Event) => selectAyaOpt(e)} />
          <OptionSelect name="hsys" label="House system" options={houseSystems}  value={hsys} setValue={setHsys} />
          <div class="field">
            <Checkbox id="toggle-sidereal" name="apply_ayanamsha" checked={applyAya()} onChange={() => updateApplyAya()} />
            <label for="toggle-sidereal">Sidereal</label>
          </div>
        </div>
        <div class="actions flex flex-column">
          <Button variant="outlined" onClick={() => updateGeoTz()}>Check time offset</Button>  
          <Button variant="outlined" onClick={() => fetchChart()}>
            Calculate
            </Button>
        </div>
        <div class="location-bar flex flex-row">
          <PlaceNameSelector value={placeString} onChange={updatePlaceName} label="Locality, region" />
          <div class="coordinates">
            <DmsInput label="Latitude" mode="lat" value={lat} changeValue={setLat} />
            <DmsInput label="Longitude" mode="lng" value={lng} changeValue={setLng} />
          </div>
           <Tooltip label={geoResetLabel(defLat(), defLng())}>
          <IconButton aria-label="set-to-current" color="primary" onClick={resetGeo}>
            <Icon>my_location</Icon>
            </IconButton>
          </Tooltip>
        </div>
      </fieldset>
      <div class="status-row flex flex-row">
        <h4 class="space-parts">
          <time class="date">{formatDate(dateString())}</time>&nbsp;
          <time class="time">{timeString()}</time>
          (<em title={tzOffset().toString()}>tz: {hrsMinsToString(offsetHrs(), offsetMins())}</em> <Show when={ tz()?.valid }><em title={ tz()?.zoneName }>{ tz()?.abbreviation }</em></Show>)
        </h4>
        <h4 class="space-parts"><strong>UTC</strong> <em title={ tzOffset().toString() }>{utcDateString()}</em></h4>
        <h4 class="slash-parts">
          <span class="lat" title={decPlaces4(lat())} >{degAsLatStr(lat())}</span>&nbsp;
          <span class="lng" title={decPlaces4(lng())}>{degAsLngStr(lng())}</span>
        </h4>
      </div>
      <div class="results-pane">
        <Show when={showData()}><ChartData data={chart()} applyAya={applyAya()} /></Show>
      </div>
    </>
  );
}
