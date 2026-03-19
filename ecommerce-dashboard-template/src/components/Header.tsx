import avatarImg from "../assets/avatar.jpg";
import { Menu } from "lucide-react";
import { toggleNavbar } from "../store/slices/extraSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const Header = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { openedComponent } = useAppSelector((state) => state.extra);
  const dispatch = useAppDispatch();

  return (
    <header className="flex justify-between mb-3 pb-2">
      <p className="flex items-center gap-3 text-sm">
        <span className="text-gray-500">{user?.name}</span>
        <span>/</span>
        <span>{openedComponent}</span>
      </p>
      <div className="flex gap-3 items-center">
        <Menu className="block md:hidden" onClick={() => dispatch(toggleNavbar())} />
        <img src={user?.avatar?.url || avatarImg} alt={user?.name || "avatar"} className="w-14 h-14 rounded-full object-cover" />
      </div>
    </header>
  );
};

export default Header;
