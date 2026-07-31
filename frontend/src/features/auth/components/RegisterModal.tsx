import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { register } from "@/features/auth/authSlice";
import { setAuthPopupView, toggleAuthPopup } from "@/app/popupSlice";
import type { AppDispatch } from "@/app/store";
import type { RootState } from "@/types";

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
    <Modal isOpen onClose={() => dispatch(toggleAuthPopup())} title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="w-5 h-5" />}
          required
        />
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
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
        />
        <Button type="submit" loading={isSigningUp} loadingText="Signing up...">
          Create Account
        </Button>
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
    </Modal>
  );
};

export default RegisterModal;
