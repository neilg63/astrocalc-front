import { For, Show } from "solid-js";
import { degAsDms } from "~/api/converters";
import { matchAyaNameByNum } from "~/api/mappings";
import { SphutaSet } from "~/api/models";

export default function UpaGroup({ data }: { data: SphutaSet }) {
  return <dl class="variant-set grid-2">
    <dt>Ayanamasha</dt>
    <dd>{ matchAyaNameByNum(data.ayanamashaNum)}</dd>
    <For each={data.items}>
      {(item) => <>
        <dt>{item.name}</dt>
        <dd>
            {degAsDms(item.value)}
        </dd>
      </>}
  </For>
  </dl>
}