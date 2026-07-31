import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "./ThemeContext";
import ScrollToTop from "./ScrollToTop";
import ErrorBoundary from "./ErrorBoundary";
import Spinner from "@/components/ui/Spinner";
import Navbar from "@/features/layout/components/Navbar";
import Sidebar from "@/features/layout/components/Sidebar";
import Footer from "@/features/layout/components/Footer";
import SearchOverlay from "@/features/search/components/SearchOverlay";
import AISearchOverlay from "@/features/search/components/AISearchOverlay";
import QuickViewModal from "@/features/products/components/QuickViewModal";
import CartSidebar from "@/features/cart/components/CartSidebar";
import BackToTop from "@/features/layout/components/BackToTop";
import ProfilePanel from "@/features/auth/components/ProfilePanel";
import LoginModal from "@/features/auth/components/LoginModal";
import RegisterModal from "@/features/auth/components/RegisterModal";
import ForgotPasswordModal from "@/features/auth/components/ForgotPasswordModal";
import ResetPasswordModal from "@/features/auth/components/ResetPasswordModal";
import { getUser } from "@/features/auth/authSlice";
import { fetchAllProducts } from "@/features/products/productSlice";
import type { RootState } from "@/types";
import type { AppDispatch } from "./store";

// Route-level code splitting: pages are only loaded when their route is visited
const HomePage = lazy(() => import("@/features/home/pages/HomePage"));
const ProductsPage = lazy(() => import("@/features/products/pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/features/products/pages/ProductDetailPage"));
const CartPage = lazy(() => import("@/features/cart/pages/CartPage"));
const WishlistPage = lazy(() => import("@/features/wishlist/pages/WishlistPage"));
const OrdersPage = lazy(() => import("@/features/orders/pages/OrdersPage"));
const PaymentPage = lazy(() => import("@/features/checkout/pages/PaymentPage"));
const AboutPage = lazy(() => import("@/features/marketing/pages/About"));
const FAQPage = lazy(() => import("@/features/marketing/pages/FAQ"));
const ContactPage = lazy(() => import("@/features/marketing/pages/Contact"));
const NotFoundPage = lazy(() => import("@/features/marketing/pages/NotFound"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Spinner size="lg" />
  </div>
);

const App = () => {
  const { isCheckingAuth } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => { dispatch(getUser()); }, [dispatch]);
  useEffect(() => { dispatch(fetchAllProducts({})); }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/password/reset/:token" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <Footer />
          </div>
          <ToastContainer />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
