import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { sendToken, setAuthCookie } from "../utils/jwtToken.js";
import crypto from "crypto";
import {
  buildGoogleAuthUrl,
  findOrCreateGoogleUser,
  getGoogleProfile,
} from "../services/googleOAuthService.js";
import { generateEmailTemplate } from "../utils/generateForgotPasswordEmailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";
import { v2 as cloudinary } from "cloudinary";
import {
  changePassword,
  clearResetToken,
  createResetToken,
  loginUser,
  promoteToAdmin,
  registerAdminUser,
  registerUser,
  resetUserPassword,
  updateUserProfile,
} from "../services/authService.js";

export const register = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    const user = await registerUser(name, email, password);
    sendToken(user, 201, "User registered successfully", res);
  }
);

export const registerAdmin = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, email, password, adminSecretKey } = req.body as {
      name: string;
      email: string;
      password: string;
      adminSecretKey: string;
    };
    const user = await registerAdminUser(name, email, password, adminSecretKey);
    sendToken(user, 201, "Admin registered successfully", res);
  }
);

export const login = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string };
    const user = await loginUser(email, password);
    sendToken(user, 200, "Logged In.", res);
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
    const { user, resetToken } = await createResetToken(email);
    const resetPasswordUrl = `${frontendUrl}/password/reset/${resetToken}`;
    const message = generateEmailTemplate(resetPasswordUrl);
    try {
      await sendEmail({ email: user.email, subject: "Ecommerce Password Recovery", message });
      res.status(200).json({ success: true, message: `Email sent to ${user.email} successfully.` });
    } catch {
      await clearResetToken(email);
      return next(new ErrorHandler("Email could not be sent.", 500));
    }
  }
);

export const resetPassword = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { token } = req.params as { token: string };
    const { password, confirmPassword } = req.body as {
      password: string;
      confirmPassword: string;
    };
    const user = await resetUserPassword(token, password, confirmPassword);
    sendToken(user, 200, "Password reset successfully", res);
  }
);

export const updatePassword = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    };
    await changePassword(req.user, currentPassword, newPassword, confirmNewPassword);
    res.status(200).json({ success: true, message: "Password updated successfully." });
  }
);

export const updateProfile = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, email } = req.body as { name: string; email: string };
    let avatarData: { public_id?: string; url?: string } = {};
    if (req.files && req.files.avatar) {
      const avatar = req.files.avatar as any;
      if (req.user?.avatar?.public_id) {
        await cloudinary.uploader.destroy(req.user.avatar.public_id);
      }
      const newProfileImage = await cloudinary.uploader.upload(avatar.tempFilePath, {
        folder: "Ecommerce_Avatars",
        width: 150,
        crop: "scale",
      });
      avatarData = { public_id: newProfileImage.public_id, url: newProfileImage.secure_url };
    }
    const user = await updateUserProfile(req.user.id, name, email, avatarData);
    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully.", user });
  }
);

export const makeAdmin = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { email } = req.body as { email: string };
    const user = await promoteToAdmin(email);
    res.status(200).json({ success: true, message: "User promoted to Admin.", user });
  }
);

export const googleAuth = catchAsyncErrors(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });
    res.redirect(buildGoogleAuthUrl(state));
  }
);

export const googleCallback = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { code, state, error } = req.query as {
      code?: string;
      state?: string;
      error?: string;
    };
    const clearStateCookie = () =>
      res.clearCookie("google_oauth_state", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    const frontendUrl = process.env.FRONTEND_URL || "https://shop-mate-six-azure.vercel.app";
    if (error) {
      clearStateCookie();
      return res.redirect(`${frontendUrl}?google=error`);
    }
    const stateCookie = req.cookies?.google_oauth_state;
    if (stateCookie && state !== stateCookie) {
      clearStateCookie();
      return res.redirect(`${frontendUrl}?google=error`);
    }
    if (!code) {
      clearStateCookie();
      return res.redirect(`${frontendUrl}?google=error`);
    }

    const profile = await getGoogleProfile(code);
    const user = await findOrCreateGoogleUser(profile);
    setAuthCookie(user, res);
    clearStateCookie();

    res.redirect(`${frontendUrl}?google=success`);
  }
);
