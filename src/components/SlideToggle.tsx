import { Switch } from "@suid/material";
import { Accessor } from "solid-js";
import { notEmptyString } from "~/api/utils";

export default function SlideToggle({ offName, onName, isOn, onChange, key }: { offName: string, onName: string; isOn: Accessor<boolean | undefined>; onChange: Function; key?: string }) {
  
  const buildWrapperClasses = () => {
    const cls = ["field", "flex", "flex-row", "value-toggle"];
    if (notEmptyString(key)) {
      cls.push(key as string);
    }
    if (isOn()) {
      cls.push("on");
    } else {
      cls.push("off");
    }
    return cls.join(" ")
  }
  const setOn = () => {
    if (!isOn()) {
      onChange();
    }
  }
  const setOff = () => {
    if (isOn()) {
      onChange();
    }
  }
  return <div class={buildWrapperClasses()}>
      <label class="off-label" onClick={() => setOff()}>{ offName }</label>
      <Switch checked={isOn()} onChange={() => onChange()} />
      <label class="on-label" onClick={() => setOn()}>{onName}</label>
    </div>
}