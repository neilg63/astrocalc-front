import { For } from "solid-js";
import { degAsDmsFlexi } from "~/api/converters";
import { matchByHouseKey } from "~/api/mappings";
import { HouseSet } from "~/api/models";

export default function HouseGroup({ data }: { data: HouseSet }) {
  const title = `House system: ${matchByHouseKey(data.system)}`
  return <div class="house-set">
    <h5>{ title }</h5>
    <ol class="house-system" title={title}>
      <For each={data.houses}>
        {(deg) => <>
          <li>{degAsDmsFlexi(deg)}</li>
        </>}
    </For>
    </ol>
  </div>
}