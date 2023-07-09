import { For, Show } from "solid-js";
import { camelToTitle, decPlaces4, decPlaces6, degAsDms, degDecHint, julToLongDate, standardDecHint, tropicalDecHint } from "~/api/converters";
import { matchNameByGrahaKey } from "~/api/mappings";
import { Body, BodySet, ProgressSet } from "~/api/models";
import Tooltip from "./Tooltip";


export default function ProgressTable({ data }: {data: ProgressSet}) {
  const hasData = data.hasData;
  const bodyKeys = data.bodyKeys;
  const numCols = bodyKeys.length + 1;

  const toDateTime = (jd = 0): string => julToLongDate(jd, data.tz.utcOffset);

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
        return 'Longitude';
      case 1:
        return 'Right ascension';
      case 2:
        return 'Azimuth';
      default:
        return 'Lng';
    }
  }

  const buildBodyLabel = (body: Body) => {
    const parts = [degDecHint(body.lng, lngLabel())]
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
  
  return <table class="progress-data">
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
          <td class="datetime">{ toDateTime(item.jd) }</td>
          <For each={item.bodies}>
            {(body, bi) => <td class={toBodyClasses(body, bi())}>
              <Tooltip label={buildBodyLabel(body)}>{degAsDms(body.lng)}</Tooltip>
            </td>}
          </For>
      </tr>}
      </For>
    </tbody>
  </table>

}