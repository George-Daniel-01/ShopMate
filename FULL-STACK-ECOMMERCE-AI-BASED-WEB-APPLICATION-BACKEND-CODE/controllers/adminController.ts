import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { database } from "../database/db.js";
import { v2 as cloudinary } from "cloudinary";
import { IUser } from "../types/index.js";

export const getAllUsers = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const totalUsersResult = await database.query<{ count: string }>(
      "SELECT COUNT(*) FROM users WHERE role = $1", ["User"]
    );
    const totalUsers = parseInt(totalUsersResult.rows[0].count);
    const offset = (page - 1) * 10;
    const users = await database.query<IUser>(
      "SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      ["User", 10, offset]
    );
    res.status(200).json({ success: true, totalUsers, currentPage: page, users: users.rows });
  }
);

export const deleteUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const result = await database.query<IUser>("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0)
      return next(new ErrorHandler("User not found", 404));
    const avatar = result.rows[0].avatar;
    if (avatar?.public_id) {
      await cloudinary.uploader.destroy(avatar.public_id);
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  }
);

export const dashboardStats = catchAsyncErrors(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split("T")[0];
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const totalRevenueAllTimeQuery = await database.query<{ sum: string }>(
      `SELECT SUM(total_price) FROM orders WHERE paid_at IS NOT NULL`
    );
    const totalRevenueAllTime = parseFloat(totalRevenueAllTimeQuery.rows[0].sum) || 0;

    const totalUsersCountQuery = await database.query<{ count: string }>(
      `SELECT COUNT(*) FROM users WHERE role = 'User'`
    );
    const totalUsersCount = parseInt(totalUsersCountQuery.rows[0].count) || 0;

    const orderStatusCountsQuery = await database.query<{ order_status: string; count: string }>(
      `SELECT order_status, COUNT(*) FROM orders WHERE paid_at IS NOT NULL GROUP BY order_status`
    );
    const orderStatusCounts: Record<string, number> = {
      Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0,
    };
    orderStatusCountsQuery.rows.forEach((row) => {
      orderStatusCounts[row.order_status] = parseInt(row.count);
    });

    const todayRevenueQuery = await database.query<{ sum: string }>(
      `SELECT SUM(total_price) FROM orders WHERE created_at::date = $1 AND paid_at IS NOT NULL`,
      [todayDate]
    );
    const todayRevenue = parseFloat(todayRevenueQuery.rows[0].sum) || 0;

    const yesterdayRevenueQuery = await database.query<{ sum: string }>(
      `SELECT SUM(total_price) FROM orders WHERE created_at::date = $1 AND paid_at IS NOT NULL`,
      [yesterdayDate]
    );
    const yesterdayRevenue = parseFloat(yesterdayRevenueQuery.rows[0].sum) || 0;

    const monthlySalesQuery = await database.query<{ month: string; totalsales: string }>(
      `SELECT TO_CHAR(created_at, 'Mon YYYY') AS month, DATE_TRUNC('month', created_at) as date, SUM(total_price) as totalsales
       FROM orders WHERE paid_at IS NOT NULL GROUP BY month, date ORDER BY date ASC`
    );
    const monthlySales = monthlySalesQuery.rows.map((row) => ({
      month: row.month,
      totalsales: parseFloat(row.totalsales) || 0,
    }));

    const topSellingProductsQuery = await database.query(
      `SELECT p.name, p.images->0->>'url' AS image, p.category, p.ratings, SUM(oi.quantity) AS total_sold
       FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN orders o ON o.id = oi.order_id
       WHERE o.paid_at IS NOT NULL GROUP BY p.name, p.images, p.category, p.ratings
       ORDER BY total_sold DESC LIMIT 5`
    );

    const currentMonthSalesQuery = await database.query<{ total: string }>(
      `SELECT SUM(total_price) AS total FROM orders WHERE paid_at IS NOT NULL AND created_at BETWEEN $1 AND $2`,
      [currentMonthStart, currentMonthEnd]
    );
    const currentMonthSales = parseFloat(currentMonthSalesQuery.rows[0].total) || 0;

    const lowStockProductsQuery = await database.query<{ name: string; stock: number }>(
      `SELECT name, stock FROM products WHERE stock <= 5`
    );

    const lastMonthRevenueQuery = await database.query<{ total: string }>(
      `SELECT SUM(total_price) AS total FROM orders WHERE paid_at IS NOT NULL AND created_at BETWEEN $1 AND $2`,
      [previousMonthStart, previousMonthEnd]
    );
    const lastMonthRevenue = parseFloat(lastMonthRevenueQuery.rows[0].total) || 0;

    let revenueGrowth = "0%";
    if (lastMonthRevenue > 0) {
      const growthRate = ((currentMonthSales - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueGrowth = `${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(2)}%`;
    }

    const newUsersThisMonthQuery = await database.query<{ count: string }>(
      `SELECT COUNT(*) FROM users WHERE created_at >= $1 AND role = 'User'`,
      [currentMonthStart]
    );
    const newUsersThisMonth = parseInt(newUsersThisMonthQuery.rows[0].count) || 0;

    res.status(200).json({
      success: true,
      message: "Dashboard Stats Fetched Successfully",
      totalRevenueAllTime, todayRevenue, yesterdayRevenue, totalUsersCount,
      orderStatusCounts, monthlySales, currentMonthSales,
      topSellingProducts: topSellingProductsQuery.rows,
      lowStockProducts: lowStockProductsQuery.rows,
      revenueGrowth, newUsersThisMonth,
    });
  }
);
