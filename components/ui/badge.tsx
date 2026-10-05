import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Badge({
  variant = "secondary",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: "secondary" | "outline" }) {
  return (
    <span
      data-slot="badge"
      className={cn("ui-badge", `ui-badge-${variant}`, className)}
      {...props}
    />
  );
}
