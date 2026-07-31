import express from "express";
import {
  forgotPassword,
  getUser,
  googleAuth,
  googleCallback,
  login,
  logout,
  makeAdmin,
  register,
  registerAdmin,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  makeAdminSchema,
  registerAdminSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from "../validations/index.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/register-admin", validate(registerAdminSchema), registerAdmin);
router.post("/make-admin", validate(makeAdminSchema), makeAdmin);
router.post("/login", validate(loginSchema), login);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/me", isAuthenticated, getUser);
router.get("/logout", isAuthenticated, logout);
router.post("/password/forgot", validate(forgotPasswordSchema), forgotPassword);
router.put("/password/reset/:token", validate(resetPasswordSchema), resetPassword);
router.put("/password/update", isAuthenticated, validate(updatePasswordSchema), updatePassword);
router.put("/profile/update", isAuthenticated, validate(updateProfileSchema), updateProfile);

export default router;
