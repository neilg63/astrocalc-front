import { For, Show } from "solid-js";
import { capitalize, julToDateFormat, daysToString } from "~/api/converters";
import { MoonPhaseList, MoonPhase } from "~/api/models";
import IconTrigger from "./IconTrigger";
import DateTimeTip from "./DateTimeTip";

export default function MoonPhaseTable({ data }: { data: MoonPhaseList }) {
  const tzOffset = data.tz.utcOffset;
  const toTabGrid = () => {
    const rows = data.items.map((row: MoonPhase) => {
      return [row.num, julToDateFormat(row.jd, tzOffset), row.days].join("\t");
    });
    return [...rows].join("\n")
  }

  const copyGrid = () => {
    const grid = toTabGrid();
    navigator.clipboard.writeText(grid);
  }

  const rowClasse = (cell: MoonPhase, index = -1): string => {
    const cls = [cell.num, index % 2 === 0? 'odd' : 'even'];
    return cls.join(" ");
  }
  const phaseIcon = (num = 0): string => {
    
    switch (num) {
      case 1:
        return '"🌑';
      case 2:
        return '🌓';
      case 3:
        return '🌕"';
      case 4:
        return '🌗';
      default:
        return '';
    }
  }
  const phaseLabel = (num = 0): string => {
    
    switch (num) {
      case 1:
        return 'New moon';
      case 2:
        return '2nd quarter';
      case 3:
        return 'Full moon';
      case 4:
        return '4th quarter';
      default:
        return '';
    }
  }
  const numCols = 4;
  return <table>
    <thead>
      <tr>
        <th></th>
        <th class="left">Phase</th>
        <th class="left">Start date & time</th>
        <th class="left">Duration</th>
      </tr>
    </thead>
    <tbody>
    <Show when={data.hasItems}>
      <For each={data.items}>
        {(row, ri) => <tr class={rowClasse(row, ri())}>
          <td class="phase icon">
            {phaseIcon(row.num)}
          </td>
        <td class="phase-label label">
            {phaseLabel(row.num)}
          </td>
          <td class="datetime">
            <DateTimeTip jd={row.jd} utcOffset={tzOffset} label={'Date/time'}></DateTimeTip>
          </td>
          <td class="duration">
            <Show when={row.hasDayLength}>{daysToString(row.days)}</Show>
          </td>
      </tr>}
      </For>
      </Show>
    </tbody>
    <tfoot>
      <tr><th colspan={numCols}>
        <IconTrigger label="Copy data grid for spreadsheets" color="info" onClick={() => copyGrid()} icon="content_copy" />
      </th></tr>
    </tfoot>
  </table>
}