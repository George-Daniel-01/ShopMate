import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getDashboardStats } from "@/features/dashboard/adminSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import SideBar from "./SideBar";

/**
 * Authenticated shell for the admin area. Renders the fixed sidebar and the
 * active section (via <Outlet />). Redirects to /login for non-admins.
 */
const DashboardLayout = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) dispatch(getDashboardStats());
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SideBar />
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
