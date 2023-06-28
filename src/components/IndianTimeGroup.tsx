import { Show } from "solid-js";
import { decPlaces4, percent, secsToPeriod, yesNo } from "~/api/converters";
import { weekDayNameSun } from "~/api/mappings";
import { ITime } from "~/api/models";

export default function IndianTimeGroup({ data }: { data: ITime }) {
  return <dl class="grid-2">
      <dt>Ghati, vighati, lipta</dt>
      <dd class="slash-parts">
        <span class="ghati">{data.ghati}</span>
        <span class="vighati">{data.vighati}</span>
        <span class="lipta">{decPlaces4(data.lipta)}</span>
      </dd>
      <dt>Day length</dt>
      <dd class="day-length">
        {secsToPeriod(data.dayLengthSeconds)}
    </dd>
    <dt>% progress</dt>
      <dd class="progress">
        {percent(data.progress)}
    </dd>
    <dt>Period</dt>
    <dd class="period slash-parts">
      <span class="period">{data.period}</span>
      <Show when={data.dayBefore}><span class="before-dawn">Before dawn</span></Show>
    </dd>
      <dt>Weekday</dt>
    <dd class="week-day">
      {weekDayNameSun(data.weekDayNum)}
    </dd>
    <dt>Day of year</dt>
    <dd class="day-of-year">
      {data.dayNum}
      </dd>
    </dl>
}