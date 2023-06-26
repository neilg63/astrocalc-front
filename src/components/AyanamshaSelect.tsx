import { For } from "solid-js";
import { snakeToWords } from "~/api/converters";
import { ayanamshas } from "~/api/mappings";

export default function AyanamashaSelect({ value, onSelect }: { value: string; onSelect: Function }) {
  const isSelected = (refKey: string): boolean => {
    return refKey === value;
  }
  return <select class="ayanamshas" onChange={(e) => onSelect(e)}>
    <For each={ayanamshas}>
      {(item) => <option value={item.key} selected={isSelected(item.key)}>{snakeToWords(item.name)}</option>}
    </For>
  </select>
}