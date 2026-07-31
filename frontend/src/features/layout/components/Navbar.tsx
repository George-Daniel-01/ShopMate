import type { ReactNode } from "react";
import {
  Menu,
  User,
  ShoppingCart,
  Sun,
  Moon,
  Search,
  Heart,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../app/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  toggleAIModal,
  toggleAuthPopup,
  toggleCart,
  toggleSearchBar,
  toggleSidebar,
} from "../../../app/popupSlice";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

const IconButton = ({
  label,
  onClick,
  children,
  badge,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  badge?: number;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="relative p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-200"
  >
    {children}
    {typeof badge === "number" && badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center px-1">
        {badge > 99 ? "99+" : badge}
      </span>
    )}
  </button>
);

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();

  const { cart } = useAppSelector((state) => state.cart);
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const cartItemsCount = cart?.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <nav className="fixed left-0 w-full top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* LEFT - MOBILE MENU */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-105 transition-transform">
                S
              </span>
              <span className="hidden sm:block text-xl font-bold tracking-tight text-primary">
                ShopMate
              </span>
            </Link>
          </div>

          {/* CENTER - DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT SIDE ICONS */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <IconButton label="Toggle theme" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </IconButton>

            <IconButton label="Search" onClick={() => dispatch(toggleSearchBar())}>
              <Search className="w-5 h-5" />
            </IconButton>

            <IconButton label="AI Search" onClick={() => dispatch(toggleAIModal())}>
              <Sparkles className="w-5 h-5" />
            </IconButton>

            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-200"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center px-1">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <IconButton label="Account" onClick={() => dispatch(toggleAuthPopup())}>
              <User className="w-5 h-5" />
            </IconButton>

            <IconButton label="Cart" onClick={() => dispatch(toggleCart())} badge={cartItemsCount}>
              <ShoppingCart className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
