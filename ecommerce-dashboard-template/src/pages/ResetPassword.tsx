import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { resetPassword } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg max-w-md w-full p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Reset Password</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Choose a new password for your account</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="Enter your new password" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
          </div>
          <div className="p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required placeholder="Confirm your password" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
          </div>
          <div className="px-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 rounded-md bg-[#111827] hover:bg-gray-800 text-white font-semibold py-2.5 text-sm disabled:opacity-50">
              {loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Resetting...</span></>) : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
