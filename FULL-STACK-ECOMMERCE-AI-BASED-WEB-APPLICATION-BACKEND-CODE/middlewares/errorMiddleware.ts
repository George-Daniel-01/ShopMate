import { Request, Response, NextFunction } from "express";

class ErrorHandler extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ErrorHandler.prototype);
  }
}

export const errorMiddleware = (
  err: ErrorHandler,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  if ((err as any).code === 11000) {
    err = new ErrorHandler("Duplicate field value entered", 400);
  }
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("JSON Web Token is invalid, try again", 400);
  }
  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("JSON Web Token has expired, try again", 400);
  }
  if (err.name === "CastError") {
    err = new ErrorHandler(`Invalid ${(err as any).path}: ${(err as any).value}`, 400);
  }

  const errorMessage: string =
    (err as any).errors
      ? Object.values((err as any).errors)
          .map((e: any) => e.message)
          .join(" ")
      : err.message;

  res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;
