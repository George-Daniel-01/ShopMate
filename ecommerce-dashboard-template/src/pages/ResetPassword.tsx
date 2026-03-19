import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { resetPassword } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user?.role === "Admin") return <Navigate to="/" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("password", formData.password);
    data.append("confirmPassword", formData.confirmPassword);
    dispatch(resetPassword(data, token ?? ""));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200 px-4">
      <div className="bg-white shadow-lg rounded-2xl max-w-md w-full p-8 sm:p-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="Enter your new password" className="w-full px-4 py-3 border border-gray-300 rounded-md" />
          </div>
          <div className="p-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required placeholder="Confirm your password" className="w-full px-4 py-3 border border-gray-300 rounded-md" />
          </div>
          <div className="px-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 disabled:opacity-50">
              {loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Resetting...</span></>) : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
