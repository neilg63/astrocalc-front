import { For, Show } from "solid-js";
import { camelToTitle, decPlaces6, standardDecHint, tropicalDecHint } from "~/api/converters";
import { matchNameByGrahaKey } from "~/api/mappings";
import { AstroChart, Graha } from "~/api/models";
import IconTrigger from "./IconTrigger";
import DegreeTip from "./DegreeTip";

export default function PositionTable({ data, applyAya }: {data: AstroChart, applyAya: boolean}) {
  const ayaOffset = applyAya ? data.ayanamsha : 0;

  const buildLngLabel = (item: Graha) => {
    const parts = [tropicalDecHint(item.lng)]
    if (item.hasTopo) {
      parts.push(`topocentric: ${decPlaces6(item.lngTopo)}`);
    }
    return parts.join(", ");
  }

  const buildLatLabel = (item: Graha) => {
    const parts = [standardDecHint(item.lat)]
    if (item.hasTopo) {
      parts.push(`topocentric: ${decPlaces6(item.latTopo)}`);
    }
    return parts.join(", ");
  }

  const toTabGrid = () => {
    const rows = data.grahas.map(body => {
      return [matchNameByGrahaKey(body.key), body.longitude(data.ayanamsha), body.lng, body.lngSpeed, body.lat, body.latSpeed, body.rectAscension, body.declination,body.azimuth, body.altitude].join("\t");
    })
    const header = ['Name', 'Sid. Longitude', 'Trop. Longitude', 'Lng. Speed', 'Latitude', 'Lat. peed', 'Right Asc.', 'Declination','Azimuth', 'Altitude']
    return [header, ...rows].join("\n")
  }

  const copyGrid = () => {
    const grid = toTabGrid();
    navigator.clipboard.writeText(grid);
  }
  const footColSpan = 9;
  const modeClasseNames = applyAya ? ['sidereal-mode'] : ['tropical-mode'];
  const modeClasses = modeClasseNames.join(" ");
  return <table class={modeClasses}>
    <thead>
      <tr>
        <th class="key">Body</th>
        <th class="lng sid-based">Longitude</th>
        <th class="lng-speed">Lng. Speed</th>
        <th class="lat">Latitude</th>
        <th class="lat-speed">Lat. Speed</th>
        <th class="ras">Right ascension</th>
        <th class="dec">Declination</th>
        <th class="azi">Azimuth</th>
        <th class="alt">Altitude</th>
      </tr>
    </thead>
    <tbody>
    <For each={data.grahas}>
        {(item) => <tr class={item.key}>
          <td class="key">{ matchNameByGrahaKey(item.key) }</td>
          <td class="numeric lng sid-based" >
            <DegreeTip label={buildLngLabel(item)} degree={item.longitude(ayaOffset)} />
          </td>
          <td class="numeric lng-speed"><Show when={item.showLngSpeed}>
            {decPlaces6(item.lngSpeed)}
          </Show><Show when={!item.showLngSpeed}>-</Show></td>
          <td class="numeric lat"><Show when={item.showLat}>
            <DegreeTip label={buildLatLabel(item)} degree={item.lat} />
          </Show><Show when={!item.showLat}>-</Show></td>
          <td class="numeric lat-speed"><Show when={item.showLatSpeed}>{decPlaces6(item.latSpeed)}</Show><Show when={!item.showLatSpeed}>-</Show></td>
          <td class="numeric ras">
            <DegreeTip label={standardDecHint(item.rectAscension)} degree={item.rectAscension} />
          </td>
          <td class="numeric dec">
            <DegreeTip label={standardDecHint(item.declination)} degree={item.declination} />
          </td>
          <td class="numeric azi">
            <DegreeTip label={standardDecHint(item.azimuth)} degree={item.azimuth} />
          </td>
          <td class="numeric alt">
            <Show when={item.showAltitude}><DegreeTip label={standardDecHint(item.altitude)} degree={item.altitude} /></Show>
            <Show when={!item.showAltitude}>-</Show>
          </td>
      </tr>}
      </For>
    </tbody>
    <tfoot>
      <tr><th colspan={footColSpan}>
        <IconTrigger label="Copy data grid compatible with spreadsheets" color="info" onClick={() => copyGrid()} icon="content_copy" />
      </th></tr>
    </tfoot>
  </table>

}