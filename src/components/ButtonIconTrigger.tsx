import { Button, Icon } from "@suid/material";
import Tooltip from "./Tooltip";
import { OverridableStringUnion } from "@suid/types";
import { ButtonPropsColorOverrides, ButtonPropsSizeOverrides } from "@suid/material/Button";
import { notEmptyString } from "~/api/utils";

export default function ButtonIconTrigger({ name, label, onClick, icon, color, size, key }: { name: string, label: string; onClick: Function; icon: string; color: OverridableStringUnion<"inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning", ButtonPropsColorOverrides>; size?: OverridableStringUnion<"small" | "medium" | "large", ButtonPropsSizeOverrides>; key?: string }) {
  const classNames = notEmptyString(key) ? key : "submit";
  return <Tooltip label={label } single={true}>
    <Button variant="contained" color={color} size={size} onClick={() => onClick()} class={classNames}>
      <Icon>{icon}</Icon>
      <span class="text-label">{ name }</span>
    </Button>
  </Tooltip>
}