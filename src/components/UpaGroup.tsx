import { For, Show } from "solid-js";
import { degAsDms } from "~/api/converters";
import { matchAyaNameByNum } from "~/api/mappings";
import { SphutaSet } from "~/api/models";

export default function UpaGroup({ data }: { data: SphutaSet }) {
  const title = `Ayanamasha: ${matchAyaNameByNum(data.ayanamashaNum)}`
  return <dl class="upagraha-row variant-set grid-2" title={ title }>
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