import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-md bg-[hsla(var(--glass-bg))]"
        onClick={onClose}
      />
      <div className="relative z-10 glass-panel w-full max-w-md mx-4 animate-fade-in-up">
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
