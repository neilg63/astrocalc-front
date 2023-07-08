import { Switch } from "@suid/material";
import { Accessor } from "solid-js";
import { notEmptyString } from "~/api/utils";

export default function SlideToggle({ offName, onName, isOn, onChange, key }: { offName: string, onName: string; isOn: Accessor<boolean | undefined>; onChange: Function; key?: string }) {
  const keyClass = notEmptyString(key) ? key : "value-toggle";
  const statusClass = () => isOn() ? "on" : "off";
  const wrapperClasses = ["field", "flex", "flex-row", keyClass, statusClass()].join(" ");
  return <div class={wrapperClasses}>
    <label class="off-label">{ offName }</label>
      <Switch checked={isOn()} onChange={() => onChange()} />
      <label class="on-label">{onName}</label>
    </div>
}