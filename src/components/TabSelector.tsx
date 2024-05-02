import { Button, ButtonGroup } from "@suid/material";
import { Accessor, For } from "solid-js";import Tooltip from "./Tooltip";
import { notEmptyString } from "~/api/utils";


interface TabItem {
  label: string;
  value: string;
  name: string;
}

const tabItems: TabItem[] = [
  { label: "Core planetary positions, transits and special degrees", value: "core", name: "Core" },
  { label: "Extended planetary positions over time", value: "extended", name: "Extended" },
  { label: "Extended sun rise and set times", value: "transitions_sun", name: "Sun Rise/Set" },
  { label: "Sequential transitions of Sun, Moon and planets", value: "transitions_bodies", name: "Transitions" },
];



export default function TabSelector({ pane, setPane, parent }: { pane: Accessor<string>, setPane: Function; parent?: Accessor<string>;   }) {
  

  const parentRef = parent instanceof Function ? parent() : "";
  const hasParent = notEmptyString(parentRef);

  const tabSelectorClasses = (): string => {
    const firstClass = hasParent ? "subtab-selector" : 'tab-selector';
    return [firstClass, pane()].join(' ');
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