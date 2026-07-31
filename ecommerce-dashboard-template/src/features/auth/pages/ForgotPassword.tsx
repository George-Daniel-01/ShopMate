import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import { forgotPassword } from "../authSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user?.role === "ADMIN") return <Navigate to="/" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
            S
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ll email you a link to reset your password
          </p>
        </div>
        <div className="card-surface p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@example.com"
              icon={<Mail className="w-4 h-4" />}
            />
            <div className="flex justify-end text-sm text-muted-foreground">
              <Link to="/login" className="text-foreground hover:underline font-medium">
                Remember Password?
              </Link>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading} disabled={loading}>
              Send Reset Link <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
