import jwt, { SignOptions } from "jsonwebtoken";
import { Response } from "express";
import { IUser } from "../types/index.js";
import { env, envNum } from "./env.js";

const stripPassword = (user: IUser) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const sendToken = (
  user: IUser,
  statusCode: number,
  message: string,
  res: Response
): void => {
  const secret = env("JWT_SECRET_KEY");
  const cookieExpireDays = envNum("COOKIE_EXPIRES_IN");

  const options: SignOptions = {
    expiresIn: env("JWT_EXPIRES_IN") as SignOptions["expiresIn"],
  };

  const token = jwt.sign({ id: user.id }, secret, options);

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({ success: true, user: stripPassword(user), message, token });
};
