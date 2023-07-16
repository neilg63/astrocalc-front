import { For, Show } from "solid-js";
import { decPlaces4, degAsDms, degAsLatStr, degAsLngStr, julToLongDate, secsToString, snakeToWords, subtractLng360 } from "~/api/converters";
import { AstroChart } from "~/api/models";
import IndianTimeGroup from "./IndianTimeGroup";
import SphutaGroup from "./SphutaGroup";
import UpaGroup from "./UpaGroup";
import TransitionTable from "./TransitionTable";
import PositionTable from "./PositionTable";
import HouseGroup from "./HouseGroup";

export default function ChartData({ data, applyAya }: {data: AstroChart, applyAya: boolean}) {
  const ayaOffset = applyAya ? data.ayanamsha : 0;
  const toDegDms = (deg: number): string => degAsDms(subtractLng360(deg, ayaOffset));
  return <section>
    <div class="flex flow-row top-info">
      <dl class="grid grid-2">
        <dt>Location</dt>
        <dd class="slash-parts"><span class="lat">{degAsLatStr(data.geo.lat)}</span><span class="lng">{degAsLngStr(data.geo.lng)}</span></dd>
        <dt>Local time</dt>
        <dd>{julToLongDate(data.jd, data.tzOffsetSeconds)} ({secsToString(data.tzOffsetSeconds)})</dd>
        <dt>UTC</dt>
        <dd>{julToLongDate(data.jd, 0)}</dd>
        <dt>Julian day</dt>
        <dd>{ decPlaces4(data.jd)}</dd>
        <dt>Ayanamsha</dt>
        <dd class="space-parts">
          <span>{snakeToWords(data.ayanamshaKey)}</span>
          <span>{ degAsDms(data.ayanamsha) }</span>
        </dd>
      </dl>
      <dl class="grid flex-grid">
        <dt>ascendant</dt>
        <dd title={decPlaces4(data.points.ascendant)}>{toDegDms(data.points.ascendant)}</dd>
        <dt>ARMC</dt>
        <dd title={decPlaces4(data.points.armc)}>{toDegDms(data.points.armc)}</dd>
        <dt>Ascendant azimuth</dt>
        <dd title={decPlaces4(data.points.ascAzi)}>{degAsDms(data.points.ascAzi)}</dd>
        <dt>Ascendant declination</dt>
        <dd>{degAsDms(data.points.ascDec)}</dd>
        <dt>Ascendant right ascension</dt>
        <dd>{degAsDms(data.points.ascRa)}</dd>
        <dt title="(Walter Koch)">co-ascendant 1</dt>
        <dd title={decPlaces4(data.points.coasc1) }>{degAsDms(data.points.coasc1)}</dd>
        <dt title="(Michael Munkasey)">Co-ascendant 2</dt>
        <dd title={decPlaces4(data.points.coasc2) }>{degAsDms(data.points.coasc2)}</dd>
        <dt>equatorial ascendant</dt>
        <dd title={decPlaces4(data.points.equasc) }>{degAsDms(data.points.equasc)}</dd>
        <dt>MC</dt>
        <dd title={decPlaces4(data.points.mc) }>{toDegDms(data.points.mc)}</dd>
        <dt>MC Altitude</dt>
        <dd title={decPlaces4(data.points.mcAlt) }>{degAsDms(data.points.mcAlt)}</dd>
        <Show when={data.points.hasMcAzi}>
          <dt>MC azimuth</dt>
          <dd title={decPlaces4(data.points.mcAzi)}>{degAsDms(data.points.mcAzi)}</dd>
        </Show>
        <dt>MC declination</dt>
        <dd title={decPlaces4(data.points.mcDec)}>{degAsDms(data.points.mcDec)}</dd>
        <dt>MC right ascension</dt>
        <dd title={decPlaces4(data.points.mcRa)}>{degAsDms(data.points.mcRa)}</dd>
        <dt title="(Michael Munkasey)">Polar ascendant</dt>
        <dd>{degAsDms(data.points.polasc)}</dd>
        <dt>Vertex</dt>
        <dd>{toDegDms(data.points.vertex)}</dd>
      </dl>
      <IndianTimeGroup data={data.indianTime} />
    </div>
    <PositionTable data={data} applyAya={applyAya} />
    <TransitionTable transitions={data.transits} tzOffset={data.tzOffsetSeconds} />
    <div class="extra-data-row flex flex-row">
      <Show when={data.hasUpagrahas}>
        <For each={data.upagrahas}>
        {(item) => <UpaGroup data={item} ayanamashaValue={data.ayanamsha} />}
      </For>
      </Show>
      <Show when={data.hasSphutas}>
        <For each={data.sphutas}>
          {(item) => <SphutaGroup data={item} ayanamashaValue={data.ayanamsha} />}
        </For>
      </Show>
      <Show when={data.hsets.length > 0}>
        <For each={data.hsets}>
          {(item) => <HouseGroup data={item} />}
        </For>
      </Show>
    </div>
  </section>

}