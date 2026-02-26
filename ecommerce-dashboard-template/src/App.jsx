
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SideBar from "./components/SideBar";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "./components/Dashboard";
import Orders from "./components/Orders";
import Products from "./components/Products";
import Profile from "./components/Profile";
import Users from "./components/Users";
import { useEffect } from "react";
import { getUser } from "./store/slices/authSlice";
import { getDashboardStats } from "./store/slices/adminSlice";
import { Loader } from "lucide-react";

function App() {
  const { openedComponent } = useSelector((state) => state.extra);
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
    dispatch(getDashboardStats());
  }, []);

  const renderDashboardContent = () => {
    switch (openedComponent) {
      case "Dashboard": return <Dashboard />;
      case "Orders": return <Orders />;
      case "Users": return <Users />;
      case "Profile": return <Profile />;
      case "Products": return <Products />;
      default: return <Dashboard />;
    }
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
            isAuthenticated && user?.role === "Admin" ? (
              <div className="flex min-h-screen">
                <SideBar />
                {renderDashboardContent()}
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      <ToastContainer position="bottom-center" />
    </Router>
  );
}

export default App;