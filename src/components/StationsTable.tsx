import { For, Show } from "solid-js";
import { decPlaces4, degDecHint } from "~/api/converters";
import { matchNameByGrahaKey } from "~/api/mappings";
import { Body, OrbitList, OrbitStation } from "~/api/models";
import DegreeTip from "./DegreeTip";
import IconTrigger from "./IconTrigger";
import { julToDateParts } from "~/api/julian-date";
import DateTimeTip from "./DateTimeTip";


export default function StationsTable({ data }: {data: OrbitList}) {
  const hasData = data.hasData;
  const bodyKeys = data.bodyKeys;
  const numCols = bodyKeys.length + 1;

  const buildInfoLabel = (body: OrbitStation) => {
    const parts = [degDecHint(body.lng, 'longitude')]
    const speed = decPlaces4(body.speed);
    parts.push(`speed: ${speed}`);
    return parts.join(", ");
  }

  const toStationLabel = (key = ''): string => {
    switch (key) {
      case 'retro-start':
        return 'Start of retrograde';
      case 'retro-end':
        return 'End of retrograde';
      case 'retro-peak':
        return 'Peak retrograde';
      case 'peak':
        return 'Peak';
      default:
        return '-';
    }
  }

  const toBodyClasses = (station: OrbitStation, index = 0) => {
    return ['station', station.type, index % 2 === 0 ? 'odd' : 'even'].join(' ');
  }

  const toRowClasses = (index = 0) => {
    return index % 2 === 0 ? 'odd' : 'even';
  }

  const toColIndices = (total = 0, divisor = 1) => {
    const second = Math.floor(divisor);
    const indices = [0, second];
    let next = Math.floor(divisor * 2);
    for (let i = second; i < total; i++) {
      if (i === next) {
        indices.push(i);
        next = Math.floor(divisor * indices.length);
      }
    }
    return indices;
  }

  const toTableData = ():OrbitStation[][] => {
    let longest = 0;
    let longestKey = "";
    const colLengths: number[] = []; 
    let colCounter = 0;
    let longestIndex = 0;
    for (const item of data.items) {
      const numSts = item.stations.length; 
      colLengths.push(numSts);
      if (numSts > longest) {
        longest = numSts;
        longestKey = item.key;
        longestIndex = colCounter;
      }
      colCounter++;
    } 
    let colIndices: number[][] = [];
    for (let i = 0; i < colLengths.length; i++) {
      const ci = colLengths[i];
      colIndices[i] = toColIndices(longest, longest / ci);
    }
    const rows: OrbitStation[][] = [];
    const numCols = data.items.length;
    for (let i = 0; i < longest; i++) {
      const cells: OrbitStation[] = [];
      for (let j = 0; j < numCols; j++) {
        const refIndices = colIndices[j];
        let refIndex = refIndices.indexOf(i);
        if (refIndex >= 0) {
          cells.push(new OrbitStation(data.items[j].stations[refIndex]))
        } else {
          cells.push(new OrbitStation())
        }
      }
      rows.push(cells);
    }
    return rows;
  }

  const toTabGrid = () => {
    const headerCells = data.bodyKeys.map(key => {
      return [matchNameByGrahaKey(key)];
    })
    const table = toTableData();
    const rows = [`${headerCells.join('","')}`];
    for (const tr of table) {
      const cells: string[] = [];
      for (const st of tr) {
        if (st.type.length > 2) {
          const dt = julToDateParts(st.jd).toISOString()
          cells.push(`${st.type}: ${dt}`);
        } else {
          cells.push('-')
        }
      }
      const innerCellsStr = cells.join('","');
      rows.push(`"${innerCellsStr}"`);
    }
    return rows.join("\n")
  }

  const copyGrid = () => {
    const grid = toTabGrid();
    navigator.clipboard.writeText(grid);
  }

  const cls = ["stations-data"];
  const wrapperClasses = cls.join(' ');
  const rows = toTableData();

  return <Show when={hasData}>
    <table class={wrapperClasses}>
      <caption>
        
      </caption>
      <thead>
        <tr>
          <For each={bodyKeys}>
            {(key) => <th class={key}>{matchNameByGrahaKey(key)}</th>}
          </For>
        </tr>
      </thead>
      <tbody>
      <For each={rows}>
          {(row, ri) => <tr class={toRowClasses(ri())}>
            <For each={row}>
              {(cell, bi) => <td class={toBodyClasses(cell, bi())}>
                <em>{toStationLabel(cell.type)}</em>
                <Show when={cell.hasData}>
                  <DateTimeTip jd={ cell.jd} utcOffset={data.utcOffset} />
                  <DegreeTip label={buildInfoLabel(cell)} degree={cell.lng} />
                </Show>
              </td>}
            </For>
        </tr>}
        </For>
      </tbody>
      <tfoot>
      <tr><th colspan={numCols}>
        <IconTrigger label="Copy data grid for spreadsheets" color="info" onClick={() => copyGrid()} icon="content_copy" />
      </th></tr>
    </tfoot>
    </table>
  </Show>

}
