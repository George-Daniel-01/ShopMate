import express from "express";
import {
  fetchSingleOrder,
  placeNewOrder,
  fetchMyOrders,
  fetchAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import {
  isAuthenticated,
  authorizedRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/new", isAuthenticated, placeNewOrder);
router.get("/orders/me", isAuthenticated, fetchMyOrders);
router.get("/admin/getall", isAuthenticated, authorizedRoles("ADMIN"), fetchAllOrders);
router.put("/cancel/:orderId", isAuthenticated, cancelOrder);
router.put("/admin/update/:orderId", isAuthenticated, authorizedRoles("ADMIN"), updateOrderStatus);
router.delete("/admin/delete/:orderId", isAuthenticated, authorizedRoles("ADMIN"), deleteOrder);
router.get("/:orderId", isAuthenticated, fetchSingleOrder);

export default router;
