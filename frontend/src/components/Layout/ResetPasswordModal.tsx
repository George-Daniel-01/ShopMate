import { useState, useEffect } from "react";
import { X, Lock, AlertCircle, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { openAuthPopup, setAuthPopupView, toggleAuthPopup } from "../../store/slices/popupSlice";
import { resetPassword, forgotPassword } from "../../store/slices/authSlice";
import { toast } from "react-toastify";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../types/index";

const ResetPasswordModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { isUpdatingPassword } = useSelector((state: RootState) => state.auth);
  const { isAuthPopupOpen, authPopupView } = useSelector((state: RootState) => state.popup);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const token = location.pathname.split("/").pop() ?? "";

  useEffect(() => {
    if (location.pathname.startsWith("/password/reset/")) {
      dispatch(setAuthPopupView("resetPassword"));
      dispatch(openAuthPopup());
    }
  }, [location.pathname, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8 || password.length > 16) {
      setError("Password must be between 8 and 16 characters");
      return;
    }
    try {
      await dispatch(resetPassword({ token, password, confirmPassword })).unwrap();
    } catch (err: any) {
      setError(err?.message || err || "Something went wrong");
    }
  };

  const handleResend = () => {
    toast.info("Go to the forgot password page to request a new link.");
    dispatch(setAuthPopupView("forgotPassword"));
  };

  if (!isAuthPopupOpen || authPopupView !== "resetPassword") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-md bg-[hsla(var(--glass-bg))]" />
      <div className="relative z-10 glass-panel w-full max-w-md mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Reset Password</h2>
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>
        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              {error.toLowerCase().includes("expired") || error.toLowerCase().includes("invalid") ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="mt-1 flex items-center gap-1 text-red-700 font-medium underline hover:no-underline"
                >
                  <Mail className="w-4 h-4" />
                  Request a new reset link
                </button>
              ) : null}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none"
              required
              minLength={8}
              maxLength={16}
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
            disabled={isUpdatingPassword}
            className={`w-full py-3 gradient-primary flex justify-center items-center gap-2 text-primary-foreground rounded-lg font-semibold animate-smooth ${
              isUpdatingPassword ? "opacity-70 cursor-not-allowed" : "hover:glow-on-hover"
            }`}
          >
            {isUpdatingPassword ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Resetting password...</span>
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
