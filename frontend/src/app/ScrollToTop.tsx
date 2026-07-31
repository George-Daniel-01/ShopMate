import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { APP_NAME } from "@/config";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const TITLES: Record<string, string> = {
  "/": `${APP_NAME} | Home`,
  "/products": `${APP_NAME} | Products`,
  "/cart": `${APP_NAME} | Cart`,
  "/wishlist": `${APP_NAME} | Wishlist`,
  "/orders": `${APP_NAME} | My Orders`,
  "/payment": `${APP_NAME} | Checkout`,
  "/about": `${APP_NAME} | About`,
  "/faq": `${APP_NAME} | FAQ`,
  "/contact": `${APP_NAME} | Contact`,
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const base = Object.keys(TITLES).find(
    (p) => p !== "/" && pathname.startsWith(p)
  );
  useDocumentTitle(TITLES[base || pathname] || APP_NAME);

  return null;
};

export default ScrollToTop;
