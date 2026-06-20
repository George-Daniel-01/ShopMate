import { useState } from "react";
import { X, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { toggleAuthPopup, setAuthPopupView } from "../../store/slices/popupSlice";
import { forgotPassword } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../types/index";

const ForgotPasswordModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isRequestingForToken } = useSelector((state: RootState) => state.auth);
  const { isAuthPopupOpen, authPopupView } = useSelector((state: RootState) => state.popup);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }))
      .unwrap()
      .then(() => setSent(true));
  };

  if (!isAuthPopupOpen || authPopupView !== "forgotPassword") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-md bg-[hsla(var(--glass-bg))]" />
      <div className="relative z-10 glass-panel w-full max-w-md mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Forgot Password</h2>
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>
        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We sent a reset link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              The link expires in 15 minutes. Check spam if you don't see it.
            </p>
            <button
              onClick={() => dispatch(toggleAuthPopup())}
              className="w-full py-3 gradient-primary text-primary-foreground rounded-lg font-semibold hover:glow-on-hover"
            >
              Done
            </button>
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={isRequestingForToken}
              className={`w-full py-3 gradient-primary flex justify-center items-center gap-2 text-primary-foreground rounded-lg font-semibold animate-smooth ${
                isRequestingForToken ? "opacity-70 cursor-not-allowed" : "hover:glow-on-hover"
              }`}
            >
              {isRequestingForToken ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending reset email...</span>
                </>
              ) : (
                "Send Reset Email"
              )}
            </button>
            <p className="mt-2 text-center">
              <button
                type="button"
                onClick={() => { setSent(false); dispatch(setAuthPopupView("login")); }}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Back to Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
