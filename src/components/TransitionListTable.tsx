import { For, Show } from "solid-js";
import { julToISODate } from "~/api/converters";
import { TransitionItem, TransitionList } from "~/api/models";
import { matchNameByGrahaKey } from "~/api/mappings";
import IconTrigger from "./IconTrigger";
import DateTimeTip from "./DateTimeTip";
import DegreeTip from "./DegreeTip";

export default function TransitionListTable({ data }: { data: TransitionList }) {
  const tzOffset = data.tz.utcOffset;

  const grahaKeys = data.transitionSets.map(tSet => tSet.key);


  const numGrahaKeys = grahaKeys.length;

  const toTabGrid = () => {
    const rows = data.rows().map((row: TransitionItem[]) => {
      return row.map((cell:TransitionItem) => julToISODate(cell.jd, tzOffset)).join("\t");
    });
    const header = data.keys.map(key => matchNameByGrahaKey(key))
    return [header, ...rows].join("\n")
  }

  const copyGrid = () => {
    const grid = toTabGrid();
    navigator.clipboard.writeText(grid);
  }

  const cellClasses = (cell: TransitionItem, index = -1) => {
    const cls = [];
    if (cell.valid) {
      cls.push(cell.key);
      if (index >= 0 && index < numGrahaKeys) {
        cls.push(grahaKeys[index])
      }
    } else {
      cls.push('empty');
    }
    return cls.join(" ");
  }
  return <table>
    <thead>
      <tr>
        <For each={grahaKeys}>
          {(key) => <th>{ matchNameByGrahaKey(key)}</th>}
        </For>
      </tr>
    </thead>
    <tbody>
    <For each={data.rows()}>
        {(row) => <tr>
          <For each={row}>
            {(cell, cellIndex) => <>
              <td class={cellClasses(cell, cellIndex())}>
                  <Show when={cell.valid}>
                <div class="column">
                  <div class="flex flow-row transition-type">
                     <strong>{cell.key}</strong>
                      <Show when={cell.hasAltitude}>
                          <DegreeTip label="Altitude" degree={cell.altitude} />
                        </Show>
                    </div>
                      <DateTimeTip jd={cell.jd} utcOffset={tzOffset}></DateTimeTip>
                  </div>
                </Show>
              </td>
            </>}
        </For>
      </tr>}
      </For>
    </tbody>
    <tfoot>
      <tr><th colspan={numGrahaKeys}>
        <IconTrigger label="Copy data grid compatible with spreadsheets" color="info" onClick={() => copyGrid()} icon="content_copy" />
      </th></tr>
    </tfoot>
  </table>
}