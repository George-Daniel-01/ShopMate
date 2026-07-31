import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { login } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg max-w-md w-full p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Welcome Back</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Sign in to your admin account</p>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="Enter your email" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
          </div>
          <div className="p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="Enter your password" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
          </div>
          <div className="px-2 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="w-4 h-4" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/password/forgot" className="text-gray-900 hover:underline font-medium">Forgot Password?</Link>
          </div>
          <div className="px-2">
            <button type="submit" className="w-full bg-[#111827] hover:bg-gray-800 text-white font-semibold py-2.5 rounded-md transition text-sm">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
