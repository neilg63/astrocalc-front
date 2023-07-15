import { julToDateParts } from "~/api/julian-date";
import Tooltip from "./Tooltip";
import { julToLongDate, secsToString } from "~/api/converters";
import { notEmptyString } from "~/api/utils";
import { Show } from "solid-js";

export default function DateTimeTip({ jd, utcOffset, label }: { jd: number; utcOffset: number;  label?: string}) {
  
  const offsetHrsMin = secsToString(utcOffset);
  const hasJd = jd > 1000;
  const [dateStr, timeStr] = hasJd ? julToLongDate(jd, utcOffset).split(' ') : ['', ''];
  const utcDTStr = hasJd ? julToDateParts(jd).toString() : '';
  const timeParts = notEmptyString(timeStr) ? timeStr.split(':') : [];
  const hasSecs = timeParts.length > 2;
  const secs = hasSecs ? timeParts.pop() : '';
  const seconds = hasSecs ? `:${secs}` : '';
  const hrsMin = timeParts.length > 1 ? timeParts.join(':') : '';
  const labelStart = notEmptyString(label) ? `${label}: ` : '';
  const labelText = hasJd ? `${labelStart}UTC ${utcDTStr} (${offsetHrsMin})` : '';

  return <Show when={hasJd}>
      <Tooltip label={labelText}>
      <time class="date">{dateStr}</time>
      <time class="hrs-min">{hrsMin}</time>
      <time class="seconds">{seconds}</time>
      </Tooltip>
    </Show>
}