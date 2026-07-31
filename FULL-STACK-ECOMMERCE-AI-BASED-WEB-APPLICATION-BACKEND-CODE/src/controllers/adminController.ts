import { Request, Response, NextFunction } from "express";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { v2 as cloudinary } from "cloudinary";
import { deleteUserById, getDashboardStats, getUsersPaginated } from "../services/adminService.js";

export const getAllUsers = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const { totalUsers, users } = await getUsersPaginated(page);
    res.status(200).json({ success: true, totalUsers, currentPage: page, users });
  }
);

export const deleteUser = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params as { id: string };
    const user = await deleteUserById(id);
    const avatar = user.avatar;
    if (avatar?.public_id) {
      await cloudinary.uploader.destroy(avatar.public_id);
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  }
);

export const dashboardStats = catchAsyncErrors(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const stats = await getDashboardStats();
    res.status(200).json({ success: true, message: "Dashboard Stats Fetched Successfully", ...stats });
  }
);
