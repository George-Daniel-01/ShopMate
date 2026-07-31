import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Lock, KeyRound } from "lucide-react";
import { resetPassword } from "../authSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user?.role === "ADMIN") return <Navigate to="/" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("password", formData.password);
    data.append("confirmPassword", formData.confirmPassword);
    dispatch(resetPassword(data, token ?? ""));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
            S
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a new password for your account
          </p>
        </div>
        <div className="card-surface p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your new password"
              icon={<Lock className="w-4 h-4" />}
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="Confirm your password"
              icon={<KeyRound className="w-4 h-4" />}
            />
            <Button type="submit" size="lg" className="w-full" loading={loading} disabled={loading}>
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
