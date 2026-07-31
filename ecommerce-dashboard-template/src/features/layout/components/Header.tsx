import { useEffect, useState } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import avatarImg from "../../../assets/avatar.jpg";
import { toggleNavbar } from "../../../app/extraSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/products": "Products",
  "/categories": "Categories",
  "/users": "Users",
  "/profile": "Profile",
};

const Header = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    const next = root.classList.contains("dark");
    setDark(next);
    localStorage.setItem("dashboard-theme", next ? "dark" : "light");
  };

  const title = TITLES[location.pathname] ?? "Dashboard";

  return (
    <header className="flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => dispatch(toggleNavbar())}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-secondary"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">Admin / {title}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <img
          src={user?.avatar?.url || avatarImg}
          alt={user?.name || "avatar"}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
        />
      </div>
    </header>
  );
};

export default Header;
