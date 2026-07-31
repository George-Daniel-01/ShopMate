import express from "express";
import {
  createProduct,
  fetchAllProducts,
  updateProduct,
  deleteProduct,
  fetchSingleProduct,
  postProductReview,
  deleteReview,
  aiSearchProducts,
} from "../controllers/productController.js";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/admin/create", isAuthenticated, authorizedRoles("ADMIN"), createProduct);
router.get("/", fetchAllProducts);
router.post("/ai-search", aiSearchProducts);
router.get("/singleProduct/:productId", fetchSingleProduct);
router.put("/post-new/review/:productId", isAuthenticated, postProductReview);
router.delete("/delete/review/:productId", isAuthenticated, deleteReview);
router.put("/admin/update/:productId", isAuthenticated, authorizedRoles("ADMIN"), updateProduct);
router.delete("/admin/delete/:productId", isAuthenticated, authorizedRoles("ADMIN"), deleteProduct);


export default router;
