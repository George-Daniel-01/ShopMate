import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "primary"
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Renders a small status dot before the label. */
  dot?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: "bg-primary text-primary-foreground",
  gold: "bg-gradient-to-r from-yellow-400 to-rose-500 text-white",
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  outline: "border border-border text-muted-foreground",
};

const Badge = ({
  variant = "primary",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap",
      VARIANT_CLASSES[variant],
      className
    )}
    {...props}
  >
    {dot && (
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
    )}
    {children}
  </span>
);

export default Badge;
