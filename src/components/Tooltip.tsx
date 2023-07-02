import { Popover } from "@suid/material";
import { JSXElement, createSignal } from "solid-js";

export default function Tooltip({ label, children }: { label: string;  children: JSXElement}) {
  const [anchorEl, setAnchorEl] = createSignal<Element | undefined>(undefined);
  const handlePopoverOpen = (event: { currentTarget: Element }) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(undefined);
  };

  const open = () => Boolean(anchorEl());

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
          {label}
        </Popover>
    </div>
}