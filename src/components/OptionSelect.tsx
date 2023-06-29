import { For } from "solid-js";
import { snakeToWords } from "~/api/converters";
import { KeyName } from "~/api/mappings";

export default function OptionSelect({ name, options, value, onSelect }: { name: string;  options: KeyName[], value: string; onSelect: Function }) {
  const isSelected = (refKey: string): boolean => {
    return refKey === value;
  }
  return <select name={name} class={name} onChange={(e) => onSelect(e)}>
    <For each={options}>
      {(item) => <option value={item.key} selected={isSelected(item.key)}>{snakeToWords(item.name)}</option>}
    </For>
  </select>
}