import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Pulsing placeholder block used while content is loading.
 * Compose with width/height classes, e.g. <Skeleton className="h-48 w-full" />.
 */
const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse bg-secondary rounded-md", className)}
    {...props}
  />
);

export default Skeleton;
