import { useEffect, useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { login } from "@/features/auth/authSlice";
import { clearPendingCheckout, setAuthPopupView, toggleAuthPopup } from "@/app/popupSlice";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton";
import type { AppDispatch } from "@/app/store";
import type { RootState } from "@/types";

const LoginModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggingIn, authUser } = useSelector((state: RootState) => state.auth);
  const { isAuthPopupOpen, authPopupView } = useSelector((state: RootState) => state.popup);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { pendingCheckout } = useSelector((state: RootState) => state.popup);

  // After a successful login, resume a checkout that was blocked for guests
  useEffect(() => {
    if (authUser && pendingCheckout) {
      dispatch(clearPendingCheckout());
      navigate("/payment");
    }
  }, [authUser, pendingCheckout, navigate, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  if (!isAuthPopupOpen || authPopupView !== "login" || authUser) return null;

  return (
    <Modal isOpen onClose={() => dispatch(toggleAuthPopup())} title="Welcome Back">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
        />
        <Button type="submit" loading={isLoggingIn} loadingText="Signing in...">
          Sign In
        </Button>
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
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <GoogleSignInButton />
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
    </Modal>
  );
};

export default LoginModal;
