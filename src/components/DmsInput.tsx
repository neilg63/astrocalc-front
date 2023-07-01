import { TextField } from "@suid/material";
import { Accessor, createEffect, createSignal } from "solid-js";
import { decPlaces, degAsDms, dmsStringToDec, smartCastFloat, smartCastInt } from "~/api/converters";
import { notEmptyString, zeroPad2 } from "~/api/utils";

export default function DmsInput({ label, value, mode, changeValue }: { label: string;  value: Accessor<number>; mode: string, changeValue: Function }) {
  const compassOptions = mode === "lat" ? `(N|S)` : `(E|W)`;
  const matchPattern = `-?[0-9][0-9]?[0-9]?º?\s+[0-9][0-9]?'?\s+[0-9][0-9]?\s*${compassOptions}` 
  const [stringValue, setStringValue] = createSignal(degAsDms(value, "lat"));
  const updateValue = (e: Event) => {
    if (e.target instanceof HTMLInputElement) {
      const { value } = e.target;
      if (typeof value === "string") {
        const dirRgx = new RegExp('^[^a-z]*?' + compassOptions + '.*?$', 'i');
        const endPart = value.replace(dirRgx, "$1");
        const dir = notEmptyString(endPart) ? endPart : '';
        const parts = value.split(/[^0-9\.]+/);
        const numParts = parts.length;
        if (numParts > 0) {
          const deg = smartCastInt(parts[0]);
          const min = numParts > 1 ? smartCastInt(parts[1]) : 0;
          const minStr = zeroPad2(min);
          const secs = numParts > 2 ? smartCastInt(parts[2]) : 0;
          const secStr = zeroPad2(secs);
          const newValue = `${deg}º ${minStr}' ${secStr}" ${dir}`;
          changeValue(dmsStringToDec(newValue));
          setStringValue(newValue)
        }
      }
    }
  }
  const register = (e: Event) => {
    if (e instanceof KeyboardEvent) {
      
      switch (e.key.toLowerCase()) {
        case 'arrowup':
          console.log(e);
          e.preventDefault();
          break;
      }
    }
  }
  createEffect(() => {
    setStringValue(degAsDms(value(), mode))
  });
  return <TextField variant="standard" value={stringValue()} label={label} inputProps={{ pattern: matchPattern, size: 20 }} size="small" onChange={(e) => updateValue(e)} onKeyDown={(e) => register(e)} />
}