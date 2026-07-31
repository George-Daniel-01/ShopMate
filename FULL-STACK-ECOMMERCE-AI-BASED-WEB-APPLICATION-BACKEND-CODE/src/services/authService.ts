import bcrypt from "bcrypt";
import crypto from "crypto";
import { database } from "../database/db.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generateResetPasswordToken } from "../utils/generateResetPasswordToken.js";
import { IUser } from "../types/index.js";

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  const existing = await database.query<IUser>("SELECT * FROM users WHERE email = $1", [email]);
  return existing.rows[0] ?? null;
};

export const registerUser = async (name: string, email: string, password: string): Promise<IUser> => {
  const existing = await findUserByEmail(email);
  if (existing) throw new ErrorHandler("User already registered with this email.", 400);
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await database.query<IUser>(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, hashedPassword]
  );
  return user.rows[0];
};

export const registerAdminUser = async (
  name: string,
  email: string,
  password: string,
  adminSecretKey: string
): Promise<IUser> => {
  if (adminSecretKey !== process.env.ADMIN_SECRET_KEY)
    throw new ErrorHandler("Invalid admin secret key.", 403);
  const existing = await findUserByEmail(email);
  if (existing) throw new ErrorHandler("User already registered with this email.", 400);
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await database.query<IUser>(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'ADMIN') RETURNING *",
    [name, email, hashedPassword]
  );
  return user.rows[0];
};

export const loginUser = async (email: string, password: string): Promise<IUser> => {
  const user = await findUserByEmail(email);
  if (!user) throw new ErrorHandler("Invalid email or password.", 401);
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) throw new ErrorHandler("Invalid email or password.", 401);
  return user;
};

export const createResetToken = async (
  email: string
): Promise<{ user: IUser; resetToken: string }> => {
  const user = await findUserByEmail(email);
  if (!user) throw new ErrorHandler("User not found with this email.", 404);
  const { hashedToken, resetPasswordExpireTime, resetToken } = generateResetPasswordToken();
  await database.query(
    `UPDATE users SET reset_password_token = $1, reset_password_expire = to_timestamp($2) WHERE email = $3`,
    [hashedToken, resetPasswordExpireTime / 1000, email]
  );
  return { user, resetToken };
};

export const clearResetToken = async (email: string): Promise<void> => {
  await database.query(
    `UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE email = $1`,
    [email]
  );
};

export const resetUserPassword = async (
  token: string,
  password: string,
  confirmPassword: string
): Promise<IUser> => {
  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await database.query<IUser>(
    "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()",
    [resetPasswordToken]
  );
  if (user.rows.length === 0) throw new ErrorHandler("Invalid or expired reset token.", 400);
  if (password !== confirmPassword) throw new ErrorHandler("Passwords do not match.", 400);
  const hashedPassword = await bcrypt.hash(password, 10);
  const updatedUser = await database.query<IUser>(
    `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2 RETURNING *`,
    [hashedPassword, user.rows[0].id]
  );
  return updatedUser.rows[0];
};

export const changePassword = async (
  user: IUser,
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string
): Promise<void> => {
  const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordMatch) throw new ErrorHandler("Current password is incorrect.", 401);
  if (newPassword !== confirmNewPassword) throw new ErrorHandler("New passwords do not match.", 400);
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await database.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user.id]);
};

export const updateUserProfile = async (
  userId: string,
  name: string,
  email: string,
  avatarData?: { public_id?: string; url?: string }
): Promise<IUser> => {
  let user;
  if (!avatarData || Object.keys(avatarData).length === 0) {
    user = await database.query<IUser>(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, userId]
    );
  } else {
    user = await database.query<IUser>(
      "UPDATE users SET name = $1, email = $2, avatar = $3 WHERE id = $4 RETURNING *",
      [name, email, avatarData, userId]
    );
  }
  return user.rows[0];
};

export const promoteToAdmin = async (email: string): Promise<IUser> => {
  const user = await database.query<IUser>(
    "UPDATE users SET role = 'ADMIN' WHERE email = $1 RETURNING *",
    [email]
  );
  if (user.rows.length === 0) throw new ErrorHandler("User not found.", 404);
  return user.rows[0];
};
