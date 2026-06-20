import { useState } from "react";
import { X, Mail, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleAuthPopup, setAuthPopupView } from "../../store/slices/popupSlice";
import { login } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../types/index";

const LoginModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggingIn, authUser } = useSelector((state: RootState) => state.auth);
  const { isAuthPopupOpen, authPopupView } = useSelector((state: RootState) => state.popup);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  if (!isAuthPopupOpen || authPopupView !== "login" || authUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-md bg-[hsla(var(--glass-bg))]" />
      <div className="relative z-10 glass-panel w-full max-w-md mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Welcome Back</h2>
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            disabled={isLoggingIn}
            className={`w-full py-3 gradient-primary flex justify-center items-center gap-2 text-primary-foreground rounded-lg font-semibold animate-smooth ${
              isLoggingIn ? "opacity-70 cursor-not-allowed" : "hover:glow-on-hover"
            }`}
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
          <p className="mt-2 text-center">
            <button
              type="button"
              onClick={() => dispatch(setAuthPopupView("forgotPassword"))}
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </p>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => dispatch(setAuthPopupView("register"))}
            className="text-primary hover:underline font-medium"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
