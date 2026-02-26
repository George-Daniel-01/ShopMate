import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { getUser } from "./store/slices/authSlice";
import { fetchAllProducts } from "./store/slices/productSlice";
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import SearchOverlay from "./components/Layout/SearchOverlay";
import CartSidebar from "./components/Layout/CartSidebar";
import ProfilePanel from "./components/Layout/ProfilePanel";
import LoginModal from "./components/Layout/LoginModal";
import Footer from "./components/Layout/Footer";
import Index from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Payment from "./pages/Payment";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const App = () => {
  const { isCheckingAuth } = useSelector((state) => state.auth);
  // ✅ FIX: Removed "productsLoading" from here.
  // productsLoading is shared between fetchAllProducts AND fetchProductDetails.
  // When ProductDetail dispatched fetchProductDetails, it set loading=true,
  // which caused App.jsx to show a full-screen spinner and block ProductDetail from rendering.
  // Each page manages its own loading state internally now.

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllProducts({}));
  }, [dispatch]);

  // Only block the app for auth check — not for product loading
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Sidebar />
          <SearchOverlay />
          <CartSidebar />
          <ProfilePanel />
          <LoginModal />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/password/reset/:token" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
        <ToastContainer />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;