import { For, Show } from "solid-js";
import { decPlaces4, decPlaces6, degDecHint, julToLongDate } from "~/api/converters";
import { matchNameByGrahaKey, toEqKey, toTopoKey } from "~/api/mappings";
import { Body, BodySet, ProgressSet } from "~/api/models";
import DegreeTip from "./DegreeTip";
import IconTrigger from "./IconTrigger";
import { julToDateParts } from "~/api/julian-date";
import DateTimeTip from "./DateTimeTip";


export default function ProgressTable({ data }: {data: ProgressSet}) {
  const hasData = data.hasData;
  const bodyKeys = data.bodyKeys;
  const numCols = bodyKeys.length + 1;
  const ayaApplied = data.ayaApplied;

  const latLabel = () => {
    switch (data.coordSystem) {
      case 0:
        return 'Latitude';
      case 1:
        return 'Declination';
      case 2:
        return 'Altitude';
    }
  }

  const lngLabel = () => {
    switch (data.coordSystem) {
      case 0:
        return data.hasAyanamsha ? 'Tropical long.' : 'Longitude';
      case 1:
        return 'Right ascension';
      case 2:
        return 'Azimuth';
      default:
        return 'Lng';
    }
  }

  const buildBodyLabel = (body: Body) => {
    const lngVal = body.longitude(data.tropicalOffset);
    const parts = [degDecHint(lngVal, lngLabel())]
    if (body.showLat) {
      parts.push(`${latLabel()}: ${decPlaces6(body.lat)}`);
    }
    if (body.showLngSpeed) {
      const speeds = [decPlaces4(body.lngSpeed)];
      if (body.showLatSpeed) {
        speeds.push(decPlaces4(body.latSpeed));
      }
      parts.push(`speeds: ${speeds.join(' / ')}`);
    }
    
    return parts.join(", ");
  }

  const toBodyClasses = (body: Body, index = 0) => {
    return [body.key, index % 2 === 0 ? 'odd' : 'even'].join(' ');
  }

  const toRowClasses = (index = 0) => {
    return index % 2 === 0 ? 'odd' : 'even';
  }

  const toTabGrid = () => {
    const bodyHeadCells = data.bodyKeys.map(key => {
      return [matchNameByGrahaKey(key)];
    })
    const header = ["Date/time", ...bodyHeadCells].join("\t");
    const rows = data.items.map(row => {
      const bodyVals = row.bodies.map(body => body.longitude(data.contextualOffset));
      return [julToDateParts(row.jd).toISOString(), ...bodyVals].join("\t")
    })
    return [header, ...rows].join("\n")
  }

  const copyGrid = () => {
    const grid = toTabGrid();
    navigator.clipboard.writeText(grid);
  }
  
  return <Show when={hasData}>
    <table class="progress-data">
      <caption>
        <dl class="flex row">
          <dt>Coordinate system</dt>
          <dd>{toEqKey(data.coordSystem)}</dd>
          <dt>Mode</dt>
          <dd>{toTopoKey(data.topoMode)}</dd>
          <dt>Ayanamsha</dt>
          <dd>{ data.appliedAyanamshaLabel }</dd>
        </dl>
      </caption>
      <thead>
        <tr>
          <th class="key">Day</th>
          <For each={bodyKeys}>
            {(key) => <th>{matchNameByGrahaKey(key)}</th>}
          </For>
        </tr>
      </thead>
      <tbody>
      <For each={data.items}>
          {(item, ri) => <tr class={toRowClasses(ri())}>
            <td class="datetime"><DateTimeTip jd={ item.jd} utcOffset={data.tz.utcOffset} /></td>
            <For each={item.bodies}>
              {(body, bi) => <td class={toBodyClasses(body, bi())}>
                <DegreeTip label={buildBodyLabel(body)} degree={body.longitude(data.contextualOffset)} />
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