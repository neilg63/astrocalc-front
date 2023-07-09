import { Button, ButtonGroup } from "@suid/material";
import { Accessor, For } from "solid-js";import Tooltip from "./Tooltip";


interface TabItem {
  label: string;
  value: string;
  name: string;
}

const tabItems: TabItem[] = [
  { label: "Core planetary positions, transitions and special degrees", value: "core", name: "Core" },
  { label: "Extended planetary positions over time", value: "extended", name: "Extended" },
  { label: "Sun, planetary and transposed transitions", value: "transitions", name: "Transitions" },
  { label: "Planetary motions and retrograde phases over time", value: "stations", name: "Motions" },
];

export default function TabSelector({ pane, setPane }: { pane: Accessor<string>, setPane: Function;   }) {
  

  const tabSelectorClasses = (): string => {
    return ['tab-selector', pane()].join(' ');
  }

  const itemType = (key: string): "contained" | "outlined" => {
    if (pane() === key) {
      return 'contained';
    } else {
      return 'outlined';
    }
  }

  const handleChange = (e: Event) => {
    if (e.target instanceof HTMLButtonElement) { 
      if (e.target.value) {
        setPane(e.target.value);
      }
      
    }
  }

  return <ButtonGroup class={tabSelectorClasses()} variant="outlined" aria-label="outlined button group" onClick={handleChange}>
    <For each={tabItems}>
      {(item) => <Tooltip label={item.label} single={true}><Button variant={itemType(item.value)}  value={item.value}>{item.name}</Button></Tooltip>}
    </For>
  </ButtonGroup>
}