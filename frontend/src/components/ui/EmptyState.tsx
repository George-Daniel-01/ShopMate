import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <div className={cn("text-center py-12", className)}>
    {icon && (
      <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground flex items-center justify-center">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    {description && (
      <p className="text-muted-foreground text-sm mb-6">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;
