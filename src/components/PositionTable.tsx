import { For, Show } from "solid-js";
import { camelToTitle, decPlaces4, decPlaces6, degAsDms } from "~/api/converters";
import { matchNameByGrahaKey } from "~/api/mappings";
import { AstroChart } from "~/api/models";

export default function PositionTable({ data, applyAya }: {data: AstroChart, applyAya: boolean}) {
  const ayaOffset = applyAya ? data.ayanamsha : 0;
  //const toDegDns = (deg: number): string => degAsDms(subtractLng360(deg, ayaOffset));
  const singleVariantSetMode = data.hasVariants && data.numVariants === 1;

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
  const footColSpan = singleVariantSetMode ? 14 : 9;
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
        <Show when={singleVariantSetMode}>
          <th class="sign">Sign</th>
          <th class="house">House</th>
          <th class="nakshatra">Nakshatra</th>
          <th class="chara-karaka">Chara Karaka</th>
          <th class="relationship">Relationship</th>
        </Show>
      </tr>
    </thead>
    <tbody>
    <For each={data.grahas}>
        {(item) => <tr class={item.key}>
          <td class="key">{ matchNameByGrahaKey(item.key) }</td>
          <td class="numeric lng sid-based" title={ decPlaces6(item.lng)}>{degAsDms(item.longitude(ayaOffset))}</td>
          <td class="numeric lng-speed"><Show when={ item.showLngSpeed}>{decPlaces4(item.lngSpeed)}</Show></td>
          <td class="numeric lat"><Show when={item.showLat}>{degAsDms(item.lat)}</Show></td>
          <td class="numeric lat-speed"><Show when={item.showLatSpeed}>{decPlaces6(item.latSpeed)}</Show></td>
          <td class="numeric ras">{degAsDms(item.rectAscension)}</td>
          <td class="numeric dec">{degAsDms(item.declination)}</td>
          <td class="numeric azi">{degAsDms(item.azimuth)}</td>
          <td class="numeric alt">{degAsDms(item.altitude)}</td>
          <Show when={singleVariantSetMode}>
            <td class="numeric sign sid-based">{item.firstVariant.sign}</td>
            <td class="numeric house sid-based">
              {item.firstVariant.house}
            </td>
            <td class="numeric nakshatra sid-based">{item.firstVariant.nakshatra}</td>
            <td class="numeric chara-karaka sid-based"><Show when={ item.firstVariant.hasCharaKaraka}>{ item.firstVariant.charaKaraka}</Show></td>
            <td class="relationship sid-based">
              <Show when={item.firstVariant.hasRelationship}>
                {camelToTitle(item.firstVariant.relationship)}
              </Show>
            </td>
          </Show>
      </tr>}
      </For>
    </tbody>
    <tfoot>
      <tr><th colspan={footColSpan}><button onClick={() => copyGrid()}>Copy table for spreadsheet</button></th></tr>
    </tfoot>
  </table>

}