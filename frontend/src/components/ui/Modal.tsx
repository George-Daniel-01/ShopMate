import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalSize = "md" | "lg" | "xl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Preset max-width: md (default), lg, or xl. */
  size?: ModalSize;
  /** z-index utility for the fixed overlay wrapper (default "z-50"). */
  zIndex?: string;
  /** Extra classes for the fixed overlay wrapper. */
  wrapperClassName?: string;
  /** Extra classes for the glass panel. */
  panelClassName?: string;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  zIndex = "z-50",
  wrapperClassName,
  panelClassName,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center",
        zIndex,
        wrapperClassName
      )}
    >
      <div
        className="absolute inset-0 backdrop-blur-md bg-[hsla(var(--glass-bg))]"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 glass-panel w-full mx-4 animate-fade-in-up",
          SIZE_CLASSES[size],
          panelClassName
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
