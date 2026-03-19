import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { database } from "../database/db.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utils/jwtToken.js";
import { generateResetPasswordToken } from "../utils/generateResetPasswordToken.js";
import { generateEmailTemplate } from "../utils/generateForgotPasswordEmailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { IUser } from "../types/index.js";

export const register = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body as {
      name: string; email: string; password: string;
    };
    if (!name || !email || !password)
      return next(new ErrorHandler("Please provide all required fields.", 400));
    if (password.length < 8 || password.length > 16)
      return next(new ErrorHandler("Password must be between 8 and 16 characters.", 400));
    const existing = await database.query<IUser>(`SELECT * FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0)
      return next(new ErrorHandler("User already registered with this email.", 400));
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await database.query<IUser>(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    sendToken(user.rows[0], 201, "User registered successfully", res);
  }
);

export const login = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password)
      return next(new ErrorHandler("Please provide email and password.", 400));
    const user = await database.query<IUser>(`SELECT * FROM users WHERE email = $1`, [email]);
    if (user.rows.length === 0)
      return next(new ErrorHandler("Invalid email or password.", 401));
    const isPasswordMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isPasswordMatch)
      return next(new ErrorHandler("Invalid email or password.", 401));
    sendToken(user.rows[0], 200, "Logged In.", res);
  }
);

export const getUser = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.status(200).json({ success: true, user: req.user });
  }
);

export const logout = catchAsyncErrors(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({ success: true, message: "Logged out successfully." });
  }
);

export const forgotPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body as { email: string };
    const { frontendUrl } = req.query as { frontendUrl: string };
    const userResult = await database.query<IUser>(`SELECT * FROM users WHERE email = $1`, [email]);
    if (userResult.rows.length === 0)
      return next(new ErrorHandler("User not found with this email.", 404));
    const user = userResult.rows[0];
    const { hashedToken, resetPasswordExpireTime, resetToken } = generateResetPasswordToken();
    await database.query(
      `UPDATE users SET reset_password_token = $1, reset_password_expire = to_timestamp($2) WHERE email = $3`,
      [hashedToken, resetPasswordExpireTime / 1000, email]
    );
    const resetPasswordUrl = `${frontendUrl}/password/reset/${resetToken}`;
    const message = generateEmailTemplate(resetPasswordUrl);
    try {
      await sendEmail({ email: user.email, subject: "Ecommerce Password Recovery", message });
      res.status(200).json({ success: true, message: `Email sent to ${user.email} successfully.` });
    } catch {
      await database.query(
        `UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE email = $1`,
        [email]
      );
      return next(new ErrorHandler("Email could not be sent.", 500));
    }
  }
);

export const resetPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token } = req.params as { token: string };
    const { password, confirmPassword } = req.body as {
      password: string; confirmPassword: string;
    };
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await database.query<IUser>(
      "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()",
      [resetPasswordToken]
    );
    if (user.rows.length === 0)
      return next(new ErrorHandler("Invalid or expired reset token.", 400));
    if (password !== confirmPassword)
      return next(new ErrorHandler("Passwords do not match.", 400));
    if (password.length < 8 || password.length > 16)
      return next(new ErrorHandler("Password must be between 8 and 16 characters.", 400));
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await database.query<IUser>(
      `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2 RETURNING *`,
      [hashedPassword, user.rows[0].id]
    );
    sendToken(updatedUser.rows[0], 200, "Password reset successfully", res);
  }
);

export const updatePassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body as {
      currentPassword: string; newPassword: string; confirmNewPassword: string;
    };
    if (!currentPassword || !newPassword || !confirmNewPassword)
      return next(new ErrorHandler("Please provide all required fields.", 400));
    const isPasswordMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isPasswordMatch)
      return next(new ErrorHandler("Current password is incorrect.", 401));
    if (newPassword !== confirmNewPassword)
      return next(new ErrorHandler("New passwords do not match.", 400));
    if (newPassword.length < 8 || newPassword.length > 16)
      return next(new ErrorHandler("Password must be between 8 and 16 characters.", 400));
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await database.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, req.user.id]);
    res.status(200).json({ success: true, message: "Password updated successfully." });
  }
);

export const updateProfile = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email } = req.body as { name: string; email: string };
    if (!name || !email)
      return next(new ErrorHandler("Please provide all required fields.", 400));
    if (!name.trim() || !email.trim())
      return next(new ErrorHandler("Name and email cannot be empty.", 400));
    let avatarData: { public_id?: string; url?: string } = {};
    if (req.files && req.files.avatar) {
      const avatar = req.files.avatar as any;
      if (req.user?.avatar?.public_id) {
        await cloudinary.uploader.destroy(req.user.avatar.public_id);
      }
      const newProfileImage = await cloudinary.uploader.upload(avatar.tempFilePath, {
        folder: "Ecommerce_Avatars", width: 150, crop: "scale",
      });
      avatarData = { public_id: newProfileImage.public_id, url: newProfileImage.secure_url };
    }
    let user;
    if (Object.keys(avatarData).length === 0) {
      user = await database.query<IUser>(
        "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
        [name, email, req.user.id]
      );
    } else {
      user = await database.query<IUser>(
        "UPDATE users SET name = $1, email = $2, avatar = $3 WHERE id = $4 RETURNING *",
        [name, email, avatarData, req.user.id]
      );
    }
    res.status(200).json({ success: true, message: "Profile updated successfully.", user: user.rows[0] });
  }
);

export const registerAdmin = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password, adminSecretKey } = req.body as {
      name: string; email: string; password: string; adminSecretKey: string;
    };
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY)
      return next(new ErrorHandler("Invalid admin secret key.", 403));
    if (!name || !email || !password)
      return next(new ErrorHandler("Please provide all required fields.", 400));
    if (password.length < 8 || password.length > 16)
      return next(new ErrorHandler("Password must be between 8 and 16 characters.", 400));
    const existing = await database.query<IUser>(`SELECT * FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0)
      return next(new ErrorHandler("User already registered with this email.", 400));
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await database.query<IUser>(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'Admin') RETURNING *",
      [name, email, hashedPassword]
    );
    sendToken(user.rows[0], 201, "Admin registered successfully", res);
  }
);

