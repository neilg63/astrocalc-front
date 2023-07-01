import { TextField } from "@suid/material";
import { Accessor, For, createEffect, createSignal } from "solid-js";
import { smartCastFloat } from "~/api/converters";
import { searchLocation } from "~/api/fetch";
import { GeoName } from "~/api/models";
import { notEmptyString } from "~/api/utils";

export default function PlaceNameSelector({ label, value, onChange }: { label: string;  value: Accessor<string>; onChange: Function }) {
  const [stringValue, setStringValue] = createSignal(value());
  const [suggestions, setSuggestions] = createSignal([] as GeoName[]);
  

  const searchPlace = (e: Event) => {
    setSuggestions([]);
    if (e.target instanceof HTMLInputElement) {
      const { value } = e.target;
      if (notEmptyString(value,2)) {
        searchLocation(value).then(results => {  
          if (results instanceof Array) {
            const sugs = results.map(item => new GeoName(item));
            setSuggestions(sugs);
          }
        })
      }
    }
  }
  const selectPlace = (e: Event) => {
    if (e.target instanceof HTMLElement) {
      const value = e.target.textContent;
      if (notEmptyString(value)) {
        const coords = e.target.getAttribute('data-coords');
        if (typeof coords === 'string') {
          const parts = coords.split(',').map(p => smartCastFloat(p));
          if (parts.length > 1) {
            const [lat, lng] = parts;
            setStringValue(value as string);
            onChange({ name: value as string, hasGeo: true, lat, lng  });
            
          }
        }
      }
      setSuggestions([]);
    }
  }

 const textUpdate = (e: Event) => {
    if (e.target instanceof HTMLInputElement) {
      const { value } = e.target; 
      setStringValue(value as string);
      onChange({ name: value as string, hasGeo: false });
    }
  }

  createEffect(() => {
    setStringValue(value())
  });
  return <div class="place-name-wrapper flex column">
    <TextField variant="standard" label={label} value={stringValue()} inputProps={{size: 40}} onKeyUp={(e) => searchPlace(e)} onChange={(e) => textUpdate(e)} />
      <div class="suggestion-wrapper">
        <ul class="plain suggestions" id="place-name-list">
          <For each={suggestions()}>
            {(item) => <li data-coords={item.coords} onClick={(e) => selectPlace(e)}>{item.placeName}</li>}
          </For>
        </ul>
    </div>
  </div>
}