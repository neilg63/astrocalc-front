import { For, Show } from "solid-js";
import { camelToTitle, decPlaces4, degAsDms } from "~/api/converters";
import { matchNameByGrahaKey } from "~/api/mappings";
import { AstroChart } from "~/api/models";

export default function PositionTable({ data, applyAya }: {data: AstroChart, applyAya: boolean}) {
  const ayaOffset = applyAya ? data.ayanamsha : 0;
  //const toDegDns = (deg: number): string => degAsDms(subtractLng360(deg, ayaOffset));
  const singleVariantSetMode = data.hasVariants && data.numVariants === 1;

  const toTabGrid = () => {
    const rows = data.grahas.map(body => {
      return [body.longitude(data.ayanamsha), body.lng, body.lngSpeed, body.lat, body.latSpeed, body.rectAscension, body.declination,body.azimuth, body.altitude].join("\t");
    })
    const header = ['Sid. Longitude', 'Trop. Longitude', 'Lng. Speed', 'Latitude', 'Lat. peed', 'Right Asc.', 'Declination','Azimuth', 'Altitude']
    return [header, ...rows].join("\n")
  }

  const copyGrid = () => {
    const grid = toTabGrid();
    navigator.clipboard.writeText(grid);
  }
  const footColSpan = singleVariantSetMode ? 13 : 8;
  return <table>
    <thead>
      <tr>
        <th>Body</th>
        <th>Longitude</th>
        <th>Lng. Speed</th>
        <th>Latitude</th>
        <th>Lat. Speed</th>
        <th>Right ascension</th>
        <th>Declination</th>
        <th>Azimuth</th>
        <th>Altitude</th>
        <Show when={singleVariantSetMode}>
          <th>Chara Karaka</th>
          <th>House</th>
          <th>Sign</th>
          <th>Nakshatra</th>
          <th>Relationship</th>
        </Show>
      </tr>
    </thead>
    <tbody>
    <For each={data.grahas}>
        {(item) => <tr class={item.key}>
          <td class="key">{ matchNameByGrahaKey(item.key) }</td>
          <td class="numeric lng" title={ decPlaces4(item.lng)}>{degAsDms(item.longitude(ayaOffset))}</td>
          <td class="numeric lng-speed"><Show when={ item.showLngSpeed}>{decPlaces4(item.lngSpeed)}</Show></td>
          <td class="numeric lat">{degAsDms(item.lat)}</td>
          <td class="numeric lat-speed"><Show when={item.showLatSpeed}>{decPlaces4(item.latSpeed)}</Show></td>
          <td class="numeric ras">{degAsDms(item.rectAscension)}</td>
          <td class="numeric dec">{degAsDms(item.declination)}</td>
          <td class="numeric azi">{degAsDms(item.azimuth)}</td>
          <td class="numeric alt">{degAsDms(item.altitude)}</td>
          <Show when={singleVariantSetMode}>
            <td class="numeric chara-karaka"><Show when={ item.firstVariant.hasCharaKaraka}>{ item.firstVariant.charaKaraka}</Show></td>
            <td class="numeric house">
              {item.firstVariant.house}
            </td>
            <td class="numeric sign">{item.firstVariant.sign}</td>
            <td class="numeric nakshatra">{item.firstVariant.nakshatra}</td>
            <td class="relationship">
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