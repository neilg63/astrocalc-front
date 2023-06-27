import { For, Show } from "solid-js";
import { camelToTitle, decPlaces4, degAsDms } from "~/api/converters";
import { matchNameByGrahaKey } from "~/api/mappings";
import { AstroChart } from "~/api/models";

export default function PositionTable({ data, applyAya }: {data: AstroChart, applyAya: boolean}) {
  const ayaOffset = applyAya ? data.ayanamsha : 0;
  //const toDegDns = (deg: number): string => degAsDms(subtractLng360(deg, ayaOffset));
  const singleVariantSetMode = data.hasVariants && data.numVariants === 1;
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
    <For each={data.bodies}>
        {(item) => <tr class={item.key}>
          <td class="key">{ matchNameByGrahaKey(item.key) }</td>
          <td class="numeric lng" title={ decPlaces4(item.lng)}>{degAsDms(item.longitude(ayaOffset))}</td>
          <td class="numeric lng-speed">{decPlaces4(item.lngSpeed)}</td>
          <td class="numeric lat">{degAsDms(item.lat)}</td>
          <td class="numeric lat-speed">{decPlaces4(item.latSpeed)}</td>
          <td class="numeric lat">{degAsDms(item.rectAscension)}</td>
          <td class="numeric lat">{degAsDms(item.declination)}</td>
          <Show when={singleVariantSetMode}>
            <td class="numeric chara-karaka">{ item.firstVariant.charaKaraka}</td>
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
  </table>

}