import jwt, { SignOptions } from "jsonwebtoken";
import { Response } from "express";
import { IUser } from "../types/index.js";
import { env, envNum } from "./env.js";

const stripPassword = (user: IUser) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const createAuthToken = (user: IUser): string => {
  const secret = env("JWT_SECRET_KEY");
  const options: SignOptions = {
    expiresIn: env("JWT_EXPIRES_IN") as SignOptions["expiresIn"],
  };
  return jwt.sign({ id: user.id }, secret, options);
};

/** Sets the httpOnly auth cookie on the response; returns the raw token. */
export const setAuthCookie = (user: IUser, res: Response): string => {
  const token = createAuthToken(user);
  const cookieExpireDays = envNum("COOKIE_EXPIRES_IN");

  res.cookie("token", token, {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return token;
};

export const sendToken = (
  user: IUser,
  statusCode: number,
  message: string,
  res: Response
): void => {
  const token = setAuthCookie(user, res);

  res
    .status(statusCode)
    .json({ success: true, user: stripPassword(user), message, token });
};
