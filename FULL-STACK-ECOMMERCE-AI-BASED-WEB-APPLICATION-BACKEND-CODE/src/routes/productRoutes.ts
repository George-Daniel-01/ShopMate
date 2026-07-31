import express from "express";
import {
  aiSearch,
  createProduct,
  deleteProduct,
  deleteReview,
  fetchAllProducts,
  fetchSingleProduct,
  postProductReview,
  updateProduct,
} from "../controllers/productController.js";
import { authorizedRoles, isAuthenticated } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { productSchema, reviewSchema } from "../validations/index.js";

const router = express.Router();

router.post(
  "/admin/create",
  isAuthenticated,
  authorizedRoles("ADMIN"),
  validate(productSchema),
  createProduct
);
router.get("/", fetchAllProducts);
router.post("/ai-search", aiSearch);
router.get("/singleProduct/:productId", fetchSingleProduct);
router.put(
  "/post-new/review/:productId",
  isAuthenticated,
  validate(reviewSchema),
  postProductReview
);
router.delete("/delete/review/:productId", isAuthenticated, deleteReview);
router.put("/admin/update/:productId", isAuthenticated, authorizedRoles("ADMIN"), updateProduct);
router.delete("/admin/delete/:productId", isAuthenticated, authorizedRoles("ADMIN"), deleteProduct);

export default router;
