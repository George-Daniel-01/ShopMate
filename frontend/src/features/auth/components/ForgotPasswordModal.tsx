import { useState } from "react";
import { Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { forgotPassword } from "@/features/auth/authSlice";
import { setAuthPopupView, toggleAuthPopup } from "@/app/popupSlice";
import type { AppDispatch } from "@/app/store";
import type { RootState } from "@/types";

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
    <Modal isOpen onClose={() => dispatch(toggleAuthPopup())} title="Forgot Password">
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
          <Button onClick={() => dispatch(toggleAuthPopup())}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5" />}
            required
          />
          <Button type="submit" loading={isRequestingForToken} loadingText="Sending reset email...">
            Send Reset Email
          </Button>
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
    </Modal>
  );
};

export default ForgotPasswordModal;
