import { For, Show } from "solid-js";
import { capitalize, snakeToWords } from "~/api/converters";
import { SunTransitionList, TransitionSet } from "~/api/models";
import { matchNameByGrahaKey } from "~/api/mappings";
import IconTrigger from "./IconTrigger";
import DateTimeTip from "./DateTimeTip";
import DegreeTip from "./DegreeTip";
import { notEmptyString } from "~/api/utils";

export default function SunTransitionListTable({ data }: { data: SunTransitionList }) {
  const tzOffset = data.tz.utcOffset;
  const refKeys = data.keys;
  const numrefKeys = refKeys.length;
  const toKeyName = (key: string): string => {
    return key.length == 2 ? key.toUpperCase() : snakeToWords(key);
  }
  const allKeyNames = ["Phase", ...data.keys.map(toKeyName)];
  const toTabGrid = () => {
    const rows = data.items.map((row: TransitionSet) => {
      return [row.phase, row.prev, row.rise, row.mc, row.max, row.set, row.ic, row.min, row.next].join("\t");
    });
    return [allKeyNames, ...rows].join("\n")
  }

  const copyGrid = () => {
    const grid = toTabGrid();
    navigator.clipboard.writeText(grid);
  }

  const rowClasse = (cell: TransitionSet, index = -1): string => {
    const cls = [cell.phase, index % 2 === 0? 'odd' : 'even'];
    return cls.join(" ");
  }
  const phaseLabel = (phaseKey = ''): string => {
    const key = notEmptyString(phaseKey) ? phaseKey.toLowerCase() : '';
    switch (key) {
      case "daily":
        return 'daily';
      case "up":
        return 'up all day';
      case "down":
        return 'down all day';
      case "up_ended":
        return 'End of daylight';
      case "down_ended":
        return 'End of darkness';
      default:
        return 'N/A';
    }
  }
  return <table>
    <thead>
      <tr>
        <For each={allKeyNames}>
          {(name) => <th>{name}</th>}
        </For>
      </tr>
    </thead>
    <tbody>
    <For each={data.items}>
        {(row, ri) => <tr class={rowClasse(row, ri())}>
        <td class="phase">
            {phaseLabel(row.phase)}
          </td>
          <td class="prev">
            <Show when={row.showPrev}><DateTimeTip jd={row.prev} utcOffset={tzOffset} label={row.prevName}></DateTimeTip></Show>
            <Show when={!row.showPrev}>--</Show>
          </td>
          <td class="rise">
            <Show when={row.hasRise}><DateTimeTip jd={row.rise} utcOffset={tzOffset}></DateTimeTip></Show>
          </td>
          <td class="mc">
            <DateTimeTip jd={row.mc} utcOffset={tzOffset}></DateTimeTip>
          </td>
          <td class="max">
            <DegreeTip degree={row.max} label="Max. altitude" />
          </td>
          <td class="set">
            <Show when={row.hasSet}><DateTimeTip jd={row.set} utcOffset={tzOffset}></DateTimeTip></Show>
          </td>
          <td class="ic">
            <DateTimeTip jd={row.ic} utcOffset={tzOffset}></DateTimeTip>
          </td>
          <td class="min">
            <DegreeTip degree={row.min} label="Min. altitude" />
          </td>
          <td class="next">
            <Show when={row.showNext}><DateTimeTip jd={row.next} utcOffset={tzOffset} label={row.nextName}></DateTimeTip></Show>
            <Show when={!row.showNext}>--</Show>
          </td>
      </tr>}
      </For>
    </tbody>
    <tfoot>
      <tr><th colspan={numrefKeys}>
        <IconTrigger label="Copy data grid compatible with spreadsheets" color="info" onClick={() => copyGrid()} icon="content_copy" />
      </th></tr>
    </tfoot>
  </table>
}