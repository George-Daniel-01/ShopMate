import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { forgotPassword } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg max-w-md w-full p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Forgot Password</h2>
        <p className="text-sm text-center text-gray-500 mb-6">We'll email you a link to reset your password</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter your email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@example.com" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
          </div>
          <div className="px-2 flex justify-end items-center text-sm text-gray-500">
            <Link to="/login" className="text-gray-900 hover:underline font-medium">Remember Password?</Link>
          </div>
          <div className="px-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 rounded-md bg-[#111827] hover:bg-gray-800 text-white font-semibold py-2.5 text-sm transition">
              {loading ? (<><div className="w-5 h-5 border-2 bg-white border-t-transparent rounded-full animate-spin" /><span>Requesting...</span></>) : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
