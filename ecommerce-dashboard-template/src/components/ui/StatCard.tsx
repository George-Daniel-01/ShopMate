import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "success" | "warning" | "danger";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string | null;
  tone?: Tone;
}

const TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  tone = "primary",
}: StatCardProps) => (
  <div className="card-surface card-hover p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight truncate">
          {value}
        </p>
        {change && (
          <p
            className={cn(
              "text-xs font-medium mt-1.5",
              change.startsWith("+") ? "text-success" : "text-destructive"
            )}
          >
            {change} vs yesterday
          </p>
        )}
      </div>
      <div
        className={cn(
          "w-11 h-11 shrink-0 rounded-xl flex items-center justify-center",
          TONES[tone]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default StatCard;
