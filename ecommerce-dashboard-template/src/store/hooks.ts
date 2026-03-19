import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../types/index";
import type { AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
