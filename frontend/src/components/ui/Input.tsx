import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional icon rendered inside the input on the left. */
  icon?: ReactNode;
}

const Input = ({ icon, className, ...props }: InputProps) => (
  <div className="relative">
    {icon && (
      <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
        {icon}
      </span>
    )}
    <input
      className={cn(
        "w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all placeholder-muted-foreground text-foreground",
        className
      )}
      {...props}
    />
  </div>
);

export default Input;
