import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-10 h-10 border-2",
} as const;

export type SpinnerSize = keyof typeof SIZES;

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
}

const Spinner = ({ size = "sm", className, ...props }: SpinnerProps) => (
  <div
    role="status"
    aria-label="Loading"
    className={cn(
      "inline-block border-current border-t-transparent rounded-full animate-spin",
      SIZES[size],
      className
    )}
    {...props}
  />
);

export default Spinner;
