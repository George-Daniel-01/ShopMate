import express from "express";
import {
  createCategory,
  deleteCategory,
  fetchAllCategoriesController,
  updateCategory,
} from "../controllers/categoryController.js";
import { authorizedRoles, isAuthenticated } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { categorySchema } from "../validations/index.js";

const router = express.Router();

router.get("/", fetchAllCategoriesController);
router.post(
  "/admin/create",
  isAuthenticated,
  authorizedRoles("ADMIN"),
  validate(categorySchema),
  createCategory
);
router.put("/admin/update/:categoryId", isAuthenticated, authorizedRoles("ADMIN"), updateCategory);
router.delete("/admin/delete/:categoryId", isAuthenticated, authorizedRoles("ADMIN"), deleteCategory);

export default router;
