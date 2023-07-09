import { Accessor, For } from "solid-js";
import { snakeToWords } from "~/api/converters";
import { KeyName } from "~/api/mappings";
import Tooltip from "./Tooltip";

export default function OptionSelect({ name, label, options, value, setValue }: { name: string; label: string; options: KeyName[], value: Accessor<string>; setValue: Function }) {
  const controlId = [name, 'selector'].join('-');
  const onSelect = (e: Event) => {
    if (e.target instanceof HTMLSelectElement) {
      setValue(e.target.value);
    }
  };
  const isSelected = (refKey: string): boolean => {
    return refKey === value();
  }
  return <Tooltip label={label} single={true}>
    <select id={controlId} onChange={onSelect}>
      <For each={options}>
        {(item) => <option value={item.key} selected={isSelected(item.key)}>{snakeToWords(item.name)}</option>}
      </For>
    </select>
  </Tooltip>
}

/*
export default function OptionSelect({ name, label, options, value, setValue }: { name: string; label: string; options: KeyName[], value: Accessor<string>; setValue: Function }) {
  const labelId = [name, 'selector-label'].join('-');
  const controlId = [name, 'selector'].join('-');
  const onSelect = (e: SelectChangeEvent) => {
    setValue(e.target.value);
  };
  return <FormControl variant="standard">
    <InputLabel id={labelId}>{label}</InputLabel>
    <Select label={label} id={controlId} labelId={labelId} value={value()} onChange={onSelect} autoWidth>
      <For each={options}>
        {(item) => <MenuItem value={item.key}>{snakeToWords(item.name)}</MenuItem>}
      </For>
    </Select>
  </FormControl>
}
*/