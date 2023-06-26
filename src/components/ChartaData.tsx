import { For, Show } from "solid-js";
import { decPlaces4, degAsDms, degAsLatStr, degAsLngStr, julToLongDate, secsToString, snakeToWords, subtractLng360, yesNo } from "~/api/converters";
import { AstroChart } from "~/api/models";
import IndianTimeGroup from "./IndianTimeGroup";
import SphutaGroup from "./SphutaGroup";
import UpaGroup from "./UpaGroup";
import TransitionTable from "./TransitionTable";
import PositionTable from "./PositionTable";

export default function ChartData({ data, applyAya }: {data: AstroChart, applyAya: boolean}) {
  const ayaOffset = applyAya ? data.ayanamsha : 0;
  const toDegDns = (deg: number): string => degAsDms(subtractLng360(deg, ayaOffset));
  return <section>
    <h2></h2>
    <div class="row grid-2">
      <dl class="grid-2">
        <dt>Location</dt>
        <dd class="slash-parts"><span class="lat">{degAsLatStr(data.geo.lat)}</span><span class="lng">{degAsLngStr(data.geo.lng)}</span></dd>
        <dt>Local time</dt>
        <dd>{julToLongDate(data.jd, data.tzOffsetSeconds)} ({secsToString(data.tzOffsetSeconds)})</dd>
        <dt>UTC</dt>
        <dd>{ julToLongDate(data.jd, 0) }</dd>
        <dt>Ayanamsha</dt>
        <dd class="space-parts">
          <span>{snakeToWords(data.ayanamshaKey)}</span>
          <span>{ degAsDms(data.ayanamsha) }</span>
        </dd>
        <dt>Ascendant</dt>
        <dd>{ toDegDns(data.points.ascendant) }</dd>
      </dl>
      <IndianTimeGroup data={data.indianTime} />
    </div>
    <PositionTable data={data} applyAya={applyAya} />
    <TransitionTable transitions={data.transitions} tzOffset={data.tzOffsetSeconds} />
    <div class="extra-data-row flex flex-row">
      <Show when={data.hasUpagrahas}>
        <For each={data.upagrahas}>
        {(item) => <UpaGroup data={item} />}
      </For>
      </Show>
      <Show when={data.hasSphutas}>
        <For each={data.sphutas}>
          {(item) => <SphutaGroup data={item} />}
        </For>
      </Show>
    </div>
  </section>

}