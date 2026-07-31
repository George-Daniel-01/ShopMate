import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";
import Login from "@/features/auth/pages/Login";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import DashboardLayout from "@/features/layout/components/DashboardLayout";
import { getUser } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "./hooks";

// Dashboard sections are lazy-loaded so each one only loads when opened
const Dashboard = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const Orders = lazy(() => import("@/features/orders/pages/OrdersPage"));
const Users = lazy(() => import("@/features/users/pages/UsersPage"));
const Profile = lazy(() => import("@/features/profile/pages/ProfilePage"));
const Products = lazy(() => import("@/features/products/pages/ProductsPage"));
const Categories = lazy(() => import("@/features/categories/pages/CategoriesPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Loader className="w-8 h-8 animate-spin text-primary" />
  </div>
);

function App() {
  const { loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<PageLoader />}><Orders /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<PageLoader />}><Products /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<PageLoader />}><Categories /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<PageLoader />}><Users /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-center" />
    </Router>
  );
}

export default App;
