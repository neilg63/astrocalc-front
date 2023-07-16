import { Button, ButtonGroup } from "@suid/material";
import { Accessor, For } from "solid-js";import Tooltip from "./Tooltip";
import { notEmptyString } from "~/api/utils";


interface TabItem {
  label: string;
  value: string;
  name: string;
  subs?: TabItem[];
}


const transitModes: TabItem[] = [
  { label: "Extended transitions for the Sun, Moon and core planets", value: "standard", name: "Standard" },
  { label: "Extended sun transits", value: "sun", name: "Sun" },
  { label: "Transposed natal transits", value: "transposed", name: "Natal" },
];

const tabItems: TabItem[] = [
  { label: "Core planetary positions, transits and special degrees", value: "core", name: "Core", subs: [] },
  { label: "Extended planetary positions over time", value: "extended", name: "Extended", subs: [] },
  { label: "Sun, planetary and transposed transits", value: "transitions", name: "Transits", subs: transitModes },
  { label: "Planetary motions and retrograde phases over time", value: "stations", name: "Motions", subs: [] },
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
  const tabRows = () => {
    if (hasParent) {
      const parentRef = parent instanceof Function ? parent() : "";
      const parRow = tabItems.find(r => r.value === parentRef);
      if (parRow instanceof Object) {
        return parRow.subs instanceof Array ? parRow.subs : []
      } else {
        return []
      }
    } else {
      return tabItems;
    }
  }

  return <ButtonGroup class={tabSelectorClasses()} variant="outlined" aria-label="outlined button group" onClick={handleChange}>
    <For each={tabRows()}>
      {(item) => <Tooltip label={item.label} single={true}><Button variant={itemType(item.value)}  value={item.value}>{item.name}</Button></Tooltip>}
    </For>
  </ButtonGroup>
}