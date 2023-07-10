import { julToDateParts } from "~/api/julian-date";
import Tooltip from "./Tooltip";
import { julToLongDate, secsToString } from "~/api/converters";

export default function DateTimeTip({ jd, utcOffset }: { jd: number; utcOffset: number }) {
  

  const offsetHrsMin = secsToString(utcOffset);
  const [dateStr, timeStr] = julToLongDate(jd, utcOffset).split(' ')
  const utcDTStr = julToDateParts(jd).toString();
  const timeParts = timeStr.split(':');
  const hasSecs = timeParts.length;
  const secs = hasSecs ? timeParts.pop() : '';
  const seconds = hasSecs ? `:${secs}` : '';
  const hrsMin = timeParts.join(':');

  const label = `UTC ${utcDTStr} (${offsetHrsMin})`;

  return <Tooltip label={label}>
    <time class="date">{dateStr}</time>
    <time class="hrs-min">{hrsMin}</time>
    <time class="seconds">{seconds}</time>
  </Tooltip>
}