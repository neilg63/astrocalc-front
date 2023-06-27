import { For, Show } from "solid-js";
import { decPlaces4, degAsDms } from "~/api/converters";
import { matchAyaNameByNum } from "~/api/mappings";
import { SphutaSet } from "~/api/models";

export default function SphutaGroup({ data }: { data: SphutaSet }) {
  return <dl class="grid-cols flex-grid">
    <dt>Ayanamasha</dt>
    <dd>{ matchAyaNameByNum(data.ayanamashaNum)}</dd>
    <For each={data.items}>
      {(item) => <>
        <dt>{item.name}</dt>
        <Show when={item.isDeg}>
          <dd class="degree" title={ decPlaces4(item.value) }>
              {degAsDms(item.value)}
          </dd>
        </Show>
        <Show when={item.isInt}>
          <dd>
            {item.value}  
          </dd>
        </Show>
      </>}
  </For>
  </dl>
}