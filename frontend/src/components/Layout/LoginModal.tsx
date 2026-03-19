import { useState, useEffect } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useLocation } from "react-router-dom";
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import { forgotPassword, resetPassword, login, register } from "../../store/slices/authSlice";

const LoginModal = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const { authUser, isSigningUp, isLoggingIn, isRequestingForToken } = useAppSelector((state) => state.auth);
  const { isAuthPopupOpen } = useAppSelector((state) => state.popup);

  const [mode, setMode] = useState("signin"); // signin | signup | forgot | reset
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Detect reset password URL and open popup with reset mode
  useEffect(() => {
    if (location.pathname.startsWith("/password/reset/")) {
      setMode("reset");
      dispatch(toggleAuthPopup());
    }
  }, [location.pathname, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // BUG FIX: Use object instead of FormData for JSON API
    const data: Record<string, string> = { email: formData.email, password: formData.password };

    if (mode === "signup") {
      data["name"] = formData.name;
    }

    if (mode === "forgot") {
      dispatch(forgotPassword({ email: formData.email })).then(() => {
        dispatch(toggleAuthPopup());
        setMode("signin");
      });
      return;
    }

    if (mode === "reset") {
      const token = location.pathname.split("/").pop() ?? "";
      dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      );
      return;
    }

    if (mode === "signup") {
      dispatch(register(data));
    } else {
      dispatch(login(data));
    }

    // BUG FIX: Clear form after successful dispatch (use useEffect instead)
  };

  // BUG FIX: Clear form when authUser changes (successful login/register)
  useEffect(() => {
    if (authUser) {
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    }
  }, [authUser]);

  if (!isAuthPopupOpen || authUser) return null;

  // BUG FIX: Use const instead of let for isLoading
  const isLoading = isSigningUp || isLoggingIn || isRequestingForToken;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* OVERLAY */}
        <div className="absolute inset-0 backdrop-blur-md bg-[hsla(var(--glass-bg))]" />

        <div className="relative z-10 glass-panel w-full max-w-md mx-4 animate-fade-in-up">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">
              {mode === "reset"
                ? "Reset Password"
                : mode === "signup"
                ? "Create Account"
                : mode === "forgot"
                ? "Forgot Password"
                : "Welcome Back"}
            </h2>
            <button
              onClick={() => dispatch(toggleAuthPopup())}
              className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
            >
              <X className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* AUTHENTICATION FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FULL NAME - ONLY FOR SIGNUP */}
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none"
                  required
                />
              </div>
            )}

            {/* EMAIL - ALWAYS VISIBLE EXCEPT RESET MODE */}
            {mode !== "reset" && (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none"
                  required
                />
              </div>
            )}

            {/* PASSWORD - ALWAYS VISIBLE EXCEPT FOR FORGOT MODE */}
            {mode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder={mode === "reset" ? "New Password" : "Password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none"
                  required
                />
              </div>
            )}

            {/* CONFIRM PASSWORD - ONLY VISIBLE FOR RESET MODE */}
            {mode === "reset" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none"
                  required
                />
              </div>
            )}

            {/* FORGOT PASSWORD TOGGLE BUTTON/LINK */}
            {mode === "signin" && (
              <div className="text-right text-sm">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-primary hover:text-accent animate-smooth"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 gradient-primary flex justify-center items-center gap-2 text-primary-foreground rounded-lg font-semibold animate-smooth ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:glow-on-hover"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {mode === "reset"
                      ? "Resetting password..."
                      : mode === "signup"
                      ? "Signing up..."
                      : mode === "forgot"
                      ? "Requesting for email..."
                      : "Signing in..."}
                  </span>
                </>
              ) : mode === "reset" ? (
                "Reset Password"
              ) : mode === "signup" ? (
                "Create Account"
              ) : mode === "forgot" ? (
                "Send Reset Email"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* MODE TOGGLE */}
          {["signin", "signup"].includes(mode) && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode((prev) => (prev === "signup" ? "signin" : "signup"));
                }}
                className="text-primary hover:text-accent animate-smooth"
              >
                {mode === "signup"
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginModal;