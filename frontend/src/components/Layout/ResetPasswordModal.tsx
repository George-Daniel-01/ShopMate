import { useState, useEffect } from "react";
import { X, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import { resetPassword } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../types/index";

const ResetPasswordModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { isUpdatingPassword } = useSelector((state: RootState) => state.auth);
  const { isAuthPopupOpen } = useSelector((state: RootState) => state.popup);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = location.pathname.split("/").pop() ?? "";

  useEffect(() => {
    if (location.pathname.startsWith("/password/reset/")) {
      dispatch(toggleAuthPopup());
    }
  }, [location.pathname, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8 || password.length > 16) {
      toast.error("Password must be between 8 and 16 characters");
      return;
    }
    dispatch(resetPassword({ token, password, confirmPassword }));
  };

  if (!isAuthPopupOpen) return null;

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
