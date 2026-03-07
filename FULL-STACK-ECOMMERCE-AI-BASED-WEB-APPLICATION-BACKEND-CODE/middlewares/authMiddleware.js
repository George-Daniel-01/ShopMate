import jwt from "jsonwebtoken";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./errorMiddleware.js";
import { database } from "../database/db.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  console.log("========================================");
  console.log("isAuthenticated middleware hit");
  console.log("Cookies:", req.cookies);
  console.log("Token:", req.cookies?.token);
  console.log("========================================");
  
  const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");
  if (!token) {
    console.log("No token found - rejecting request");
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log("Token decoded, user ID:", decoded.id);

  const user = await database.query(
    "SELECT * FROM users WHERE id = $1 LIMIT 1",
    [decoded.id]
  );
  
  if (user.rows.length === 0) {
    console.log("User not found in database");
    return next(new ErrorHandler("User not found.", 404));
  }
  
  console.log("User authenticated:", user.rows[0].email, "Role:", user.rows[0].role);
  req.user = user.rows[0];
  next();
});

export const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    console.log("========================================");
    console.log("authorizedRoles middleware hit");
    console.log("Required roles:", roles);
    console.log("User role:", req.user?.role);
    console.log("========================================");
    
    if (!roles.includes(req.user.role)) {
      console.log("Role not authorized - rejecting");
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource.`,
          403
        )
      );
    }
    console.log("Role authorized - proceeding");
    next();
  };
};