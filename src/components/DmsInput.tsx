import { TextField } from "@suid/material";
import { Accessor, createEffect, createSignal } from "solid-js";
import { degAsDms, dmsStringToDec, dmsStringToNumParts, dmsUnitsToString } from "~/api/converters";

export default function DmsInput({ label, value, mode, changeValue }: { label: string;  value: Accessor<number>; mode: string, changeValue: Function }) {
  const compassOptions = mode === "lat" ? `(N|S)` : `(E|W)`;
  const matchPattern = `-?[0-9][0-9]?[0-9]?º?\s+[0-9][0-9]?'?\s+[0-9][0-9]?\s*${compassOptions}` 
  const [stringValue, setStringValue] = createSignal(degAsDms(value, "lat"));
  const updateValue = (e: Event) => {
    if (e.target instanceof HTMLInputElement) {
      const { value } = e.target;
      if (typeof value === "string") {
        const { deg, mins, secs, dir } = dmsStringToNumParts(value, mode);
        const newValue = dmsUnitsToString(deg, mins, secs, dir);
        changeValue(dmsStringToDec(newValue));
        setStringValue(newValue);
      }
    }
  }

  const register = (e: Event) => {
    if (e instanceof KeyboardEvent) {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'arrowdown':
          const upMode = e.key.toLowerCase().endsWith('up');
          const diff = upMode ? 1 : -1;
          if (e.currentTarget instanceof HTMLDivElement) {
            const inp = e.currentTarget.querySelector('input');
            if (inp instanceof HTMLInputElement) {
              const txt = inp.value;
              if (inp.selectionStart !== null) {
                const chIndex = inp.selectionStart;
                let ch = txt.substring(chIndex, chIndex + 1);
                if (!/[0-9]/.test(ch) && chIndex > 0) {
                  ch = txt.substring(chIndex - 1, chIndex);
                }
                
                if (/[0-9.]/.test(ch)) {
                  const { deg, mins, secs, dir } = dmsStringToNumParts(txt, mode);
                  let newDeg = deg;
                  let newMins = mins;
                  let newSecs = secs;
                  let max = mode === "lat" ? 90 : 180;

                  
                  if (chIndex < 4) {
                    if (deg + diff <= max && deg + diff >= 0) {
                      newDeg = deg + diff;
                      if (newDeg === max) {
                        newMins = 0;
                        newSecs = 0;
                      }
                    }
                  } else if (chIndex < 8) {
                    if (mins + diff <= 60 && deg + diff <= max && mins + diff >= 0) {
                      newMins = mins + diff;
                      if (newMins === 60) {
                        newSecs = 0;
                      }
                    }
                  } else {
                    if (secs + diff <= 60 && deg + diff <= max && secs + diff >= 0) {
                      newSecs = secs + diff;
                    }
                  }
                  const newValue = dmsUnitsToString(newDeg, newMins, newSecs, dir);
                  setStringValue(newValue);
                  setTimeout(() => {
                    inp.setSelectionRange(chIndex, chIndex);
                  }, 25)
                }
              }
            }
          }
          e.preventDefault();
          e.stopPropagation();
          break;
      }
    }
  }
  createEffect(() => {
    setStringValue(degAsDms(value(), mode))
  });
  return <TextField variant="standard" value={stringValue()} label={label} inputProps={{ pattern: matchPattern, size: 20 }} size="small" onChange={(e) => updateValue(e)} onKeyDown={(e) => register(e)} />
}