import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ListOrdered,
  Package,
  Tags,
  Users,
  User,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../auth/authSlice";
import { toggleNavbar } from "../../../app/extraSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/orders", label: "Orders", icon: ListOrdered },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/users", label: "Users", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

const SideBar = () => {
  const isNavbarOpened = useAppSelector((state) => state.extra.isNavbarOpened);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      {isNavbarOpened && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => dispatch(toggleNavbar())}
        />
      )}
      <aside
        className={`${
          isNavbarOpened ? "left-[10px]" : "-left-full"
        } fixed w-64 max-w-[85vw] h-[97.5%] rounded-2xl bg-card border border-border shadow-card z-40 mt-[10px] transition-all duration-300 p-4 flex flex-col md:left-[10px]`}
      >
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                S
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-tight">
                  ShopMate
                </h2>
                <p className="text-xs text-muted-foreground">Admin Console</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(toggleNavbar())}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-secondary"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <hr className="border-border" />
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                onClick={() => {
                  if (isNavbarOpened) dispatch(toggleNavbar());
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>
    </>
  );
};

export default SideBar;
