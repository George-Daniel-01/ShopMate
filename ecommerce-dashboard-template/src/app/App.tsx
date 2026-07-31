import { lazy, Suspense, useEffect } from "react";
import type { ComponentType } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";
import SideBar from "@/features/layout/components/SideBar";
import Login from "@/features/auth/pages/Login";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import { getUser } from "@/features/auth/authSlice";
import { getDashboardStats } from "@/features/dashboard/adminSlice";
import { useAppDispatch, useAppSelector } from "./hooks";

// Dashboard sections are lazy-loaded so each one only loads when opened
const Dashboard = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const Orders = lazy(() => import("@/features/orders/pages/OrdersPage"));
const Users = lazy(() => import("@/features/users/pages/UsersPage"));
const Profile = lazy(() => import("@/features/profile/pages/ProfilePage"));
const Products = lazy(() => import("@/features/products/pages/ProductsPage"));
const Categories = lazy(() => import("@/features/categories/pages/CategoriesPage"));

const SECTIONS: Record<string, ComponentType> = {
  Dashboard,
  Orders,
  Users,
  Profile,
  Products,
  Categories,
};

function App() {
  const { openedComponent } = useAppSelector((state) => state.extra);
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) dispatch(getDashboardStats());
  }, [dispatch, isAuthenticated]);

  const renderDashboardContent = () => {
    const Section = SECTIONS[openedComponent] ?? Dashboard;
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        }
      >
        <Section />
      </Suspense>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            isAuthenticated && user?.role === "ADMIN" ? (
              <div className="flex min-h-screen">
                <SideBar />
                {renderDashboardContent()}
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="bottom-center" />
    </Router>
  );
}

export default App;
