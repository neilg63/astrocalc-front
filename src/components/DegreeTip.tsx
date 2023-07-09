import { Show } from "solid-js";
import Tooltip from "./Tooltip";
import { degAsDms } from "~/api/converters";

export default function DegreeTip({ label, degree }: { label: string; degree: number }) {
  
  const parts = degAsDms(degree).split(" ");
  let deg = "";
  let mins = "";
  let secs = "";
  const numParts = parts.length;
  if (numParts > 0) {
    deg = parts[0];
    if (numParts > 1) {
      mins = parts[1];
      if (numParts > 2) {
        secs = parts[2];
      }
    }
  }

  const hasMins = mins.length > 1;
  const hasSecs = mins.length > 1;

  return <Tooltip label={label}>
    <span class="degrees">{deg}</span>
    <Show when={hasMins}><sup class="minutes">{mins}</sup></Show>
    <Show when={hasSecs}><sup class="seconds">{secs}</sup></Show>
  </Tooltip>
}