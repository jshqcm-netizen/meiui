"use client";
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
export function ToggleGroup(
  props: React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" {...props} />;
}
export function ToggleGroupItem(
  props: React.ComponentProps<typeof ToggleGroupPrimitive.Item>,
) {
  return <ToggleGroupPrimitive.Item data-slot="toggle-group-item" {...props} />;
}
