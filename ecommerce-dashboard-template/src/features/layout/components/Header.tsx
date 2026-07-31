import avatarImg from "../../../assets/avatar.jpg";
import { Menu } from "lucide-react";
import { toggleNavbar } from "../../../app/extraSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";

const Header = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { openedComponent } = useAppSelector((state) => state.extra);
  const dispatch = useAppDispatch();

  return (
    <header className="flex justify-between items-center gap-3 mb-3 pb-2">
      <p className="flex items-center gap-2 sm:gap-3 text-sm min-w-0">
        <span className="text-gray-500 truncate">{user?.name}</span>
        <span className="shrink-0">/</span>
        <span className="truncate">{openedComponent}</span>
      </p>
      <div className="flex gap-2 sm:gap-3 items-center shrink-0">
        <Menu className="block md:hidden" onClick={() => dispatch(toggleNavbar())} />
        <img src={user?.avatar?.url || avatarImg} alt={user?.name || "avatar"} className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover" />
      </div>
    </header>
  );
};

export default Header;
