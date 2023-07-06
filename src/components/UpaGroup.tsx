import { For } from "solid-js";
import { decPlaces4, decPlaces6, degAsDms } from "~/api/converters";
import { matchAyaNameByNum } from "~/api/mappings";
import { SphutaSet } from "~/api/models";
import Tooltip from "./Tooltip";

export default function UpaGroup({ data, ayanamashaValue }: { data: SphutaSet; ayanamashaValue: number}) {
  const title = data.ayanamashaNum > 0 ? `Ayanamasha applied: ${matchAyaNameByNum(data.ayanamashaNum)} ${decPlaces4(ayanamashaValue)}` : `Tropical`;
 
  const degLabel = (deg: number): string => `${decPlaces6(deg)} (${title})`;
  const wrapperClassNames = ["upagraha-rows", "variant-set", "grid-2"];
  if (data.ayanamashaNum > 0) {
    wrapperClassNames.push('aya-mode');
  }
  const wrapperClasses = wrapperClassNames.join(' ');
  return <dl class={wrapperClasses} title={ title }>
    <For each={data.items}>
      {(item) => <>
        <dt>{item.name}</dt>
        <dd class="degree">
          <Tooltip label={degLabel(item.value)}>{degAsDms(item.value)}</Tooltip>
        </dd>
      </>}
   </For>
  </dl>
}