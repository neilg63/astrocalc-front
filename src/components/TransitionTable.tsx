import { For, Show } from "solid-js";
import { degAsDms, julToISODate, julToLongDate, standardDecHint } from "~/api/converters";
import { TransitionSet } from "~/api/models";
import { matchNameByGrahaKey } from "~/api/mappings";
import IconTrigger from "./IconTrigger";
import Tooltip from "./Tooltip";
import DateTimeTip from "./DateTimeTip";

export default function TransitionTable({ transitions, tzOffset }: { transitions: TransitionSet[]; tzOffset: number }) {
  const toISODateTime = (jd = 0): string => julToISODate(jd, tzOffset,true);
  const toTabGrid = () => {
    const rows = transitions.map(row => {
      return [matchNameByGrahaKey(row.key), toISODateTime(row.rise), toISODateTime(row.mc), toISODateTime(row.set), toISODateTime(row.ic)].join("\t");
    })
    const header = ['Name', 'Set', 'Trop. Longitude', 'Lng. Speed', 'Latitude', 'Lat. peed', 'Right Asc.', 'Declination','Azimuth', 'Altitude']
    return [header, ...rows].join("\n")
  }

  const copyGrid = () => {
    const grid = toTabGrid();
    navigator.clipboard.writeText(grid);
  }
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
            <Show when={item.hasPrevSet}><DateTimeTip jd={ item.prevSet } utcOffset={tzOffset} /></Show>
          </td>
          <td class="rise"><DateTimeTip jd={ item.rise} utcOffset={tzOffset} /></td>
          <td class="mc"><DateTimeTip jd={ item.mc} utcOffset={tzOffset} /></td>
          <td class="set"><DateTimeTip jd={ item.set} utcOffset={tzOffset} /></td>
          <td class="ic"><DateTimeTip jd={ item.ic} utcOffset={tzOffset} /></td>
          <td class="next-rise">
            <Show when={item.hasNextRise}><DateTimeTip jd={ item.nextRise} utcOffset={tzOffset} /></Show>
          </td>
          <td class="numeric min">
            <Show when={item.hasMinMax}>
              <Tooltip label={standardDecHint(item.min) }>
                {degAsDms(item.min)}
              </Tooltip>
            </Show>
            </td>
          <td class="numeric max">
            <Show when={item.hasMinMax}>
              <Tooltip label={standardDecHint(item.max)}>{degAsDms(item.max)}</Tooltip>
            </Show>
          </td>
      </tr>}
      </For>
    </tbody>
    <tfoot>
      <tr><th colspan={9}>
        <IconTrigger label="Copy data grid compatible with spreadsheets" color="info" onClick={() => copyGrid()} icon="content_copy" />
      </th></tr>
    </tfoot>
  </table>
}