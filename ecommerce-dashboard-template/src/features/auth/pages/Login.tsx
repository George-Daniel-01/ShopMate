import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { login } from "../authSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user?.role === "ADMIN") return <Navigate to="/" />;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    dispatch(login(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
            S
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to the ShopMate admin console
          </p>
        </div>
        <div className="card-surface p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="admin@example.com"
              icon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your password"
              icon={<Lock className="w-4 h-4" />}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 accent-primary" />
                Remember me
              </label>
              <Link to="/password/forgot" className="text-foreground hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
