import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { forgotPassword } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user?.role === "Admin") return <Navigate to="/" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200 px-4">
      <div className="bg-white shadow-lg rounded-2xl max-w-md w-full p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter your email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-md" />
          </div>
          <div className="px-2 flex justify-end items-center text-sm text-gray-500">
            <Link to="/login" className="text-blue-600 hover:underline">Remember Password?</Link>
          </div>
          <div className="px-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition">
              {loading ? (<><div className="w-5 h-5 border-2 bg-white border-t-transparent rounded-full animate-spin" /><span>Requesting...</span></>) : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
