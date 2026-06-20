import { useState } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { toggleAuthPopup, setAuthPopupView } from "../../store/slices/popupSlice";
import { register } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../types/index";

const RegisterModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSigningUp, authUser } = useSelector((state: RootState) => state.auth);
  const { isAuthPopupOpen, authPopupView } = useSelector((state: RootState) => state.popup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    dispatch(register({ name, email, password }));
  };

  if (!isAuthPopupOpen || authPopupView !== "register" || authUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-md bg-[hsla(var(--glass-bg))]" />
      <div className="relative z-10 glass-panel w-full max-w-md mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Create Account</h2>
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none"
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSigningUp}
            className={`w-full py-3 gradient-primary flex justify-center items-center gap-2 text-primary-foreground rounded-lg font-semibold animate-smooth ${
              isSigningUp ? "opacity-70 cursor-not-allowed" : "hover:glow-on-hover"
            }`}
          >
            {isSigningUp ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing up...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => dispatch(setAuthPopupView("login"))}
            className="text-primary hover:underline font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
