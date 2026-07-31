import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders a spinner + `loadingText` instead of children. */
  loading?: boolean;
  /** Text shown next to the spinner while `loading` is true. */
  loadingText?: string;
  variant?: ButtonVariant;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "gradient-primary text-primary-foreground hover:glow-on-hover",
  outline: "border border-border text-foreground hover:bg-secondary",
  ghost: "text-primary hover:bg-secondary",
};

const Button = ({
  loading = false,
  loadingText = "Loading...",
  variant = "primary",
  type = "button",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={cn(
      "w-full py-3 rounded-lg font-semibold animate-smooth flex justify-center items-center gap-2",
      (disabled || loading) && "opacity-70 cursor-not-allowed",
      VARIANT_CLASSES[variant],
      className
    )}
    {...props}
  >
    {loading ? (
      <>
        <Spinner />
        <span>{loadingText}</span>
      </>
    ) : (
      children
    )}
  </button>
);

export default Button;
