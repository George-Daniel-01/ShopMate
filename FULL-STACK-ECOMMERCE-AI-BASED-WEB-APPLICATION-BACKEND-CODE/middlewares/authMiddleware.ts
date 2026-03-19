import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./errorMiddleware.js";
import { database } from "../database/db.js";
import { IUser } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

interface DecodedToken extends JwtPayload {
  id: string;
}

export const isAuthenticated = catchAsyncErrors(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token =
      req.cookies?.token ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new ErrorHandler("Please login to access this resource.", 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as DecodedToken;

    const user = await database.query<IUser>(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [decoded.id]
    );

    if (user.rows.length === 0) {
      return next(new ErrorHandler("User not found.", 404));
    }

    req.user = user.rows[0];
    next();
  }
);

export const authorizedRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource.`,
          403
        )
      );
    }
    next();
  };
};
