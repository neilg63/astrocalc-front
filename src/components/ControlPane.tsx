import { For, Show, createEffect, createSignal } from "solid-js";
import { fetchChartData, fetchTz, searchLocation } from "~/api/fetch";
import { formatDate, notEmptyString, yearsAgoDateString } from "~/api/utils";
import { updateInputValue } from "~/api/forms";
import { decPlaces4, degAsLatStr, degAsLngStr, dmsStringToDec, hrsMinsToString, smartCastFloat, smartCastInt } from "~/api/converters";
import { fetchGeo, getGeoTzOffset } from "~/api/geoloc-utils";
import { AstroChart, GeoLoc, GeoName, TimeZoneInfo, latLngToLocString } from "~/api/models";
import { dateStringToJulianDate, julToDateParts, localDateStringToJulianDate } from "~/api/julian-date";
import ChartData from "./ChartaData";
import { fromLocal, toLocal } from "~/lib/localstore";
import AyanamashaSelect from "./AyanamshaSelect";
import OptionSelect from "./OptionSelect";
import { houseSystems } from "~/api/mappings";

interface LocDt {
  dt: string;
  loc: string;
  jd?: number;
}

export default function ControlPanel() {
  const [dateString, setDateString] = createSignal(yearsAgoDateString(30));
  const [timeString, setTimeString] = createSignal('12:00');
  const [offsetHrs, setOffsetHrs] = createSignal(0);
  const [offsetMins, setOffsetMins] = createSignal(0);
  const [tz, setTz] = createSignal(new TimeZoneInfo());
  const [placeString, setPlaceString] = createSignal('');
  const [suggestions, setSuggestions] = createSignal([] as GeoName[]);
  const [latString, setLatString] = createSignal(`00º 00' 00"`);
  const [lngString, setLngString] = createSignal(`00º 00' 00"`);
  const [defLat, setDefLat] = createSignal(0);
  const [defLng, setDefLng] = createSignal(0);
  const [init, setInit] = createSignal(false);
  const [lat, setLat] = createSignal(0)
  const [lng, setLng] = createSignal(0);
  const [tzOffset, setTzOffset] = createSignal(0);
  const [applyAya, setApplyAya] = createSignal(true);
  const [ayaKey, setAyaKey] = createSignal("tc");
  const [hsys, setHsys] = createSignal("W");
  
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
        setChart( new AstroChart(data, tz()));
        const str = JSON.stringify(data);
        // setJson(str)
        setShowData(true);
        toLocal("current-chart", data);
      }
    });
  }
  const opneChart = () => setShowData(true);
  const updateDate = (e: Event) => updateInputValue(e, setDateString, '\\d\\d\\d\\d-[012][0-9]-[0123][0-9]');
  const updateTime = (e: Event) => updateInputValue(e, setTimeString,'[012][0-9]:[0-5][0-9](:[0-5][0-9])?');
  const updateLat = (e: Event) => {
    updateInputValue(e, setLatString);
    const deg = dmsStringToDec(latString());
    setLat(deg)
  }
  const updateLng = (e: Event) => {
    updateInputValue(e, setLngString);
    const deg = dmsStringToDec(lngString());
    setLng(deg);
  }
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

  const updateGeoTz = () => {
    const { loc, dt } = extractDtLoc();
    fetchTz(dt, loc).then((tz) => {
      if (tz instanceof Object) {
        if (typeof tz.gmtOffset === "number") {
          updateTimeOffset(tz.gmtOffset);
          setTz(new TimeZoneInfo(tz));
          toLocal("current-tz", tz);
        }
      }
    })
  }

  const searchPlace = (e: Event) => {
    setSuggestions([]);
    if (e.target instanceof HTMLInputElement) {
      const { value } = e.target;
      if (notEmptyString(value,2)) {
        searchLocation(value).then(results => {  
          if (results instanceof Array) {
            const sugs = results.map(item => new GeoName(item));
            setSuggestions(sugs);
          }
        })
      }
    }
  }

  const selectPlace = (e: Event) => {
    if (e.target instanceof HTMLElement) {
      const value = e.target.textContent;
      if (notEmptyString(value)) {
        const coords = e.target.getAttribute('data-coords');
        if (typeof coords === 'string') {
          const parts = coords.split(',').map(p => smartCastFloat(p));
          if (parts.length > 1) {
            const [lat, lng] = parts;
            syncLatLng(lat, lng);
            setPlaceString(value as string);
            toLocal('geoname', { name: value, lat, lng });
            setTimeout(updateGeoTz, 500);
          }
        }
      }
      setSuggestions([]);
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
    setLatString(degAsLatStr(lat));
    setLngString(degAsLngStr(lng));
  }

  const selectListOption = (e: Event, func: Function) => {
    if (e.target instanceof HTMLSelectElement) {
      func(e.target.value);
    }
  }

  const selectAyaOpt = (e: Event) => selectListOption(e, setAyaKey);

  const selectHsys = (e: Event) => selectListOption(e, setHsys);

  createEffect(() => {
    fetchGeo((data: any) => {
      if (data instanceof Object) {
        const { latitude, longitude } = data;
        if (typeof latitude === "number") {
          setDefLat(latitude);
          setDefLng(longitude);
          if (!init()) {
            syncLatLng(latitude, longitude);
            toLocal("current-geo", new GeoLoc({lat: latitude, lng: longitude}));
          }
        }
      }
    })
    if (!init()) {
      const secsOffset = getGeoTzOffset();
      updateTimeOffset(secsOffset);
      const cData = fromLocal("current-chart", 24 * 3600);
      const geoData = fromLocal("geoname", 24 * 3600);
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
        const chart = new AstroChart(chartData, tz())
        setChart(chart);
        syncLatLng(chart.geo.lat, chart.geo.lng);
        setTimeout(opneChart, 500);
        const dateObj = julToDateParts(chart.jd, tz().utcOffset);
        const ps = dateObj.toISOSimple().split('T');
        setDateString(ps[0]);
        setTimeString(ps[1]);
      }
      setInit(true);
    }
  })

  return (
    <>
      <fieldset class="top-controls grid top-grid" >
        <div class="date-time-bar flex flex-row">
          <input type="date" value={dateString()} size="12" onChange={(e) => updateDate(e)} />
        
          <div class="tz-offset-control">
            <input type="number" class="hours" value={offsetHrs()} size="1" onChange={(e) => updateOffset(e, false)} step="1" min="-15" max="15" />
            <input type="number" class="minutes" value={offsetMins()} size="1" onChange={(e) => updateOffset(e, true)} step="1" min="0" max="59" />
          </div>
          <AyanamashaSelect value={ayaKey()} onSelect={(e: Event) => selectAyaOpt(e)} />
          <OptionSelect name="hsys" options={houseSystems}  value={hsys()} onSelect={(e: Event) => selectHsys(e)} />
          <div class="field">
            <input id="toggle-sidereal" type="checkbox" name="apply_ayanamsha" checked={applyAya()} onChange={() => updateApplyAya()} />
            <label for="toggle-sidereal">Sidereal</label>
          </div>
        </div>
        <div class="actions flex flex-column">
          <button class="increment" onClick={() => updateGeoTz()}>Check time offset</button>  
          <button class="increment" onClick={() => fetchChart()}>
            Calculate
            </button>
        </div>
        <div class="location-bar flex flex-row">
            <input type="time" value={timeString()} size="12" onChange={(e) => updateTime(e)} />
          <div class="place-name-wrapper flex column">
            <input type="text" list="place-names" value={placeString()} size="40" onKeyUp={(e) => searchPlace(e)} />
            <div class="suggestion-wrapper">
              <ul class="plain suggestions" id="place-name-list">
                <For each={suggestions()}>
                  {(item) => <li data-coords={item.coords} onClick={(e) => selectPlace(e)}>{item.placeName}</li>}
                </For>
              </ul>
            </div>
          </div>

          <input type="text" value={latString()} pattern="-?[0-9][0-9]?º?\s+[0-9][0-9]?'?\s+[0-9][0-9]?\s*(N|S)" size="16" onChange={(e) => updateLat(e)} />
          <input type="text" value={lngString()} pattern="-?[0-9][0-9]?[0-9]?º?\s+[0-9][0-9]?'?\s+[0-9][0-9]?\s*(E|W)" size="16" onChange={(e) => updateLng(e)} />
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
        <Show when={showData()}><ChartData data={chart()} applyAya={applyAya() } /></Show>
      </div>
    </>
  );
}
