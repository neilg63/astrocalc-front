import { For } from "solid-js";
import { degAsDmsFlexi } from "~/api/converters";
import { matchByHouseKey } from "~/api/mappings";
import { HouseSet } from "~/api/models";

export default function HouseGroup({ data }: { data: HouseSet }) {
  const title = `System: ${matchByHouseKey(data.system)}`
  return <ol class="house-system" title={title}>
    <For each={data.houses}>
      {(deg) => <>
        <li>{degAsDmsFlexi(deg)}</li>
      </>}
  </For>
  </ol>
}