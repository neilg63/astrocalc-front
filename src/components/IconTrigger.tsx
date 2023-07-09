import { Icon, IconButton } from "@suid/material";
import Tooltip from "./Tooltip";
import { IconButtonPropsColorOverrides } from "@suid/material/IconButton";
import { OverridableStringUnion } from "@suid/types";

export default function IconTrigger({ label, onClick, icon, color }: { label: string; onClick: Function; icon: string; color: OverridableStringUnion<"inherit" | "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning", IconButtonPropsColorOverrides>; }) {
  return <Tooltip label={label} single={true}>
      <IconButton color={color} onClick={() => onClick()}>
        <Icon>{ icon }</Icon>
      </IconButton>
    </Tooltip>
}