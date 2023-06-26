import { For, Show } from "solid-js";
import { decPlaces4, degAsDms, degAsLatStr, degAsLngStr, julToDateOnly, julToISODate, julToLongDate, snakeToWords, subtractLng360, yesNo } from "~/api/converters";
import { AstroChart, TransitionSet } from "~/api/models";
import VariantSet from "./VariantSet";
import IndianTimeGroup from "./IndianTimeGroup";
import SphutaGroup from "./SphutaGroup";
import UpaGroup from "./UpaGroup";
import { matchNameByGrahaKey } from "~/api/mappings";

export default function TransitionTable({ transitions, tzOffset }: { transitions: TransitionSet[]; tzOffset: number }) {
  const toDateTime = (jd = 0): string => julToLongDate(jd, tzOffset);
  return <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Prev. set</th>
        <th>Rise</th>
        <th>MC</th>
        <th>Set</th>
        <th>IC</th>
        <th>Next rise</th>
        <th>Min.</th>
        <th>Max.</th>
      </tr>
    </thead>
    <tbody>
    <For each={transitions}>
        {(item) => <tr class={item.key}>
          <td class="key">{ matchNameByGrahaKey(item.key) }</td>
          <td class="prev-set">
            <Show when={item.hasNextRise}>{toDateTime(item.prevSet)}</Show>
          </td>
          <td class="rise">{toDateTime(item.rise)}</td>
          <td class="mc">{toDateTime(item.mc)}</td>
          <td class="set">{toDateTime(item.set)}</td>
          <td class="ic">{toDateTime(item.ic)}</td>
          <td class="next-rise">
            <Show when={item.hasNextRise}>{toDateTime(item.set)}</Show>
          </td>
          <td class="numeric min">
            <Show when={item.hasMinMax}>{degAsDms(item.min)}</Show>
            </td>
          <td class="numeric max">
            <Show when={item.hasMinMax}>{degAsDms(item.max)}</Show>
          </td>
      </tr>}
      </For>
      </tbody>
  </table>
}