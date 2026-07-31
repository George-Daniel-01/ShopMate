import { useState, useEffect } from "react";
import { Lock, AlertCircle, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { forgotPassword, resetPassword } from "@/features/auth/authSlice";
import { openAuthPopup, setAuthPopupView, toggleAuthPopup } from "@/app/popupSlice";
import type { AppDispatch } from "@/app/store";
import type { RootState } from "@/types";

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
    <Modal isOpen onClose={() => dispatch(toggleAuthPopup())} title="Reset Password">
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
        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
          minLength={8}
          maxLength={16}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
        />
        <Button type="submit" loading={isUpdatingPassword} loadingText="Resetting password...">
          Reset Password
        </Button>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;
