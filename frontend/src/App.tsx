import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import AISearchOverlay from "./components/Layout/AISearchOverlay";
import QuickViewModal from "./components/Products/QuickViewModal";
import BackToTop from "./components/Layout/BackToTop";
import CartSidebar from "./components/Layout/CartSidebar";
import ProfilePanel from "./components/Layout/ProfilePanel";
import LoginModal from "./components/Layout/LoginModal";
import RegisterModal from "./components/Layout/RegisterModal";
import ForgotPasswordModal from "./components/Layout/ForgotPasswordModal";
import ResetPasswordModal from "./components/Layout/ResetPasswordModal";
import Footer from "./components/Layout/Footer";
import Index from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Payment from "./pages/Payment";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import type { RootState } from "./types/index";
import type { AppDispatch } from "./store/store";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      "/": "ShopMate | Home",
      "/products": "ShopMate | Products",
      "/cart": "ShopMate | Cart",
      "/wishlist": "ShopMate | Wishlist",
      "/orders": "ShopMate | My Orders",
      "/payment": "ShopMate | Checkout",
      "/about": "ShopMate | About",
      "/faq": "ShopMate | FAQ",
      "/contact": "ShopMate | Contact",
    };
    const base = Object.keys(titles).find(
      (p) => p !== "/" && pathname.startsWith(p)
    );
    document.title = titles[base || pathname] || "ShopMate";
  }, [pathname]);

  return null;
};

const App = () => {
  const { isCheckingAuth } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => { dispatch(getUser()); }, [dispatch]);
  useEffect(() => { dispatch(fetchAllProducts({})); }, [dispatch]);

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
        <ScrollToTop />
        <div className="min-h-screen bg-background">
          <Navbar />
          <Sidebar />
          <SearchOverlay />
          <AISearchOverlay />
          <CartSidebar />
          <QuickViewModal />
          <BackToTop />
          <ProfilePanel />
          <LoginModal />
          <RegisterModal />
          <ForgotPasswordModal />
          <ResetPasswordModal />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/password/reset/:token" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
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



