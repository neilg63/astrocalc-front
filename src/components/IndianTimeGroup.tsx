import { decPlaces4, percent, secsToPeriod, yesNo } from "~/api/converters";
import { ITime } from "~/api/models";

export default function IndianTimeGroup({ data }: { data: ITime }) {
  return <dl class="grid-2">
      <dt>Ghati, vighati, lipta</dt>
      <dd class="slash-parts">
        <span class="ghati">{data.ghati}</span>
        <span class="vighati">{data.vighati}</span>
        <span class="lipta">{decPlaces4(data.lipta)}</span>
      </dd>
      <dt>Day length / progress</dt>
      <dd class="day-length slash-parts">
        <span class="length">{secsToPeriod(data.dayLengthSeconds)}</span>
        <span class="progress">{percent(data.progress)}</span>
    </dd>
    <dt>Period / before dawn</dt>
    <dd class="period slash-parts">
      <span class="period">{data.period}</span>
      <span class="before-dawn">{yesNo(data.dayBefore)}</span>
    </dd>
      <dt>Weekday / day of year</dt>
      <dd class="slash-parts">
        <span class="num">{data.weekDayNum}</span>
        <span class="num">{data.dayNum}</span>
      </dd>
    </dl>
}