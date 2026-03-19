import { useState } from "react";
import { LayoutDashboard, ListOrdered, Package, Users, User, LogOut, MoveLeft } from "lucide-react";
import { Navigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { toggleComponent, toggleNavbar } from "../store/slices/extraSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const SideBar = () => {
  const [activeLink, setActiveLink] = useState(0);
  const links = [
    { item: <LayoutDashboard />, title: "Dashboard" },
    { item: <ListOrdered />, title: "Orders" },
    { item: <Package />, title: "Products" },
    { item: <Users />, title: "Users" },
    { item: <User />, title: "Profile" },
  ];

  const isNavbarOpened = useAppSelector((state) => state.extra.isNavbarOpened);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <aside className={`${isNavbarOpened ? "left-[10px]" : "-left-full"} fixed w-64 h-[97.5%] rounded-xl bg-white z-10 mt-[10px] transition-all duration-300 shadow-lg p-4 space-y-4 flex flex-col justify-between md:left-[10px]`}>
      <nav className="space-y-2">
        <div className="flex flex-col gap-2 py-2">
          <h2 className="flex items-center justify-between text-xl font-bold">
            <span>Admin Panel</span>
            <MoveLeft className="block md:hidden" onClick={() => dispatch(toggleNavbar())} />
          </h2>
          <hr />
        </div>
        {links.map((item, index) => (
          <button key={index} onClick={() => { setActiveLink(index); dispatch(toggleComponent(item.title)); }}
            className={`${activeLink === index && "bg-dark-gradient text-white"} hover:bg-gray-200 w-full transition-all duration-300 rounded-md cursor-pointer px-3 py-2 flex items-center gap-2`}>
            {item.item} {item.title}
          </button>
        ))}
      </nav>
      <button onClick={() => dispatch(logout())} className="text-white rounded-md cursor-pointer flex items-center px-3 py-2 gap-2 bg-red-gradient">
        <LogOut /> Logout
      </button>
    </aside>
  );
};

export default SideBar;
