import express from "express";
import {
  createCategory,
  fetchAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authorizedRoles, isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", fetchAllCategories);
router.post("/admin/create", isAuthenticated, authorizedRoles("ADMIN"), createCategory);
router.put("/admin/update/:categoryId", isAuthenticated, authorizedRoles("ADMIN"), updateCategory);
router.delete("/admin/delete/:categoryId", isAuthenticated, authorizedRoles("ADMIN"), deleteCategory);

export default router;
