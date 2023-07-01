import { FormControl, InputLabel, MenuItem, Select } from "@suid/material";
import { SelectChangeEvent } from "@suid/material/Select";
import { Accessor, For, createEffect, createSignal } from "solid-js";
import { snakeToWords } from "~/api/converters";
import { KeyName } from "~/api/mappings";

export default function OptionSelect({ name, label, options, value, setValue }: { name: string; label: string; options: KeyName[], value: Accessor<string>; setValue: Function }) {
  const labelId = [name, 'selector-label'].join('-');
  const controlId = [name, 'selector'].join('-');
  const onSelect = (e: SelectChangeEvent) => {
    setValue(e.target.value);
  };
  return <FormControl variant="standard">
  <InputLabel id={labelId}>{ label}</InputLabel>
    <Select label={label} id={controlId} labelId={labelId} value={value()} class={name} onChange={onSelect} autoWidth>
      <For each={options}>
        {(item) => <MenuItem value={item.key}>{snakeToWords(item.name)}</MenuItem>}
      </For>
    </Select>
  </FormControl>
}