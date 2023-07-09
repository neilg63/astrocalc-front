import { Box, Popover } from "@suid/material";
import { For, JSXElement, Show, createSignal } from "solid-js";

export default function Tooltip({ label, single, children }: { label: string; single?: boolean; children: JSXElement}) {
  const [anchorEl, setAnchorEl] = createSignal<Element | undefined>(undefined);
  const handlePopoverOpen = (event: { currentTarget: Element }) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(undefined);
  };

  const open = () => Boolean(anchorEl());
  
  const multiLine = single !== true && label.includes(",");
  const parts = multiLine ? label.split(",").map(s => s.trim()) : [];

  return <div class="tooltip-container" aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}>
      {children}
      <Popover
        sx={{ pointerEvents: "none" }}
        class="tooltip"
          open={open()}
          anchorEl={anchorEl()}
          container={anchorEl()}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          onClose={handlePopoverClose}
        >
      <Box class="hover-content">
        <Show when={multiLine}>
          <For each={parts}>
            {(line) => <p>{ line }</p>}
          </For>
          </Show>
          <Show when={!multiLine}>
              {label}
            </Show>
          </Box>
        </Popover>
    </div>
}